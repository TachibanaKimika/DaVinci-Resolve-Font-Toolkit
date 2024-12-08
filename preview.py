#!/usr/bin/env python
import os
import mimetypes
import json
import sys
import webview

DATA_FILE = "./data/data.json"
env = os.getenv("ENV", "prod")
dvr_script = None

def get_davinci_path():
    path = ""
    if sys.platform.startswith("darwin"):
        path = "/Applications/DaVinci Resolve/DaVinci Resolve.app/Contents/Libraries/Fusion/"
    elif sys.platform.startswith("win") or sys.platform.startswith("cygwin"):
        path = "C:\\ProgramData\\Blackmagic Design\\DaVinci Resolve\\Support\\Developer\\Scripting\\Modules"
    elif sys.platform.startswith("linux"):
        path = "/opt/resolve/libs/Fusion/"
    return os.path.join(path)

if get_davinci_path() and get_davinci_path() not in sys.path:
    sys.path.append(get_davinci_path())

def load_dynamic(module_name, file_path):
    if sys.version_info[0] >= 3 and sys.version_info[1] >= 5:
        import importlib.machinery
        import importlib.util

        module = None
        spec = None
        loader = importlib.machinery.ExtensionFileLoader(module_name, file_path)
        if loader:
            spec = importlib.util.spec_from_loader(module_name, loader)
        if spec:
            module = importlib.util.module_from_spec(spec)
        if module:
            loader.exec_module(module)
        return module
    else:
        import imp
        return imp.load_dynamic(module_name, file_path)

lib_path = os.getenv("RESOLVE_SCRIPT_LIB")
script_module = None
if lib_path:
    try:
        script_module = load_dynamic("fusionscript", lib_path)
    except ImportError:
        pass
if not script_module:
    path = ""
    ext = ".so"
    if sys.platform.startswith("darwin"):
        path = "/Applications/DaVinci Resolve/DaVinci Resolve.app/Contents/Libraries/Fusion/"
    elif sys.platform.startswith("win") or sys.platform.startswith("cygwin"):
        ext = ".dll"
        path = "C:\\Program Files\\Blackmagic Design\\DaVinci Resolve\\"
    elif sys.platform.startswith("linux"):
        path = "/opt/resolve/libs/Fusion/"
    script_module = load_dynamic("fusionscript", os.path.join(path, "fusionscript" + ext))

if script_module:
    dvr_script = script_module
    print("load done")
else:
    raise ImportError("Could not locate module dependencies")

class Database:

    def __init__(self):
        self.initialize_data_file()

    def initialize_data_file(self):
        try:
            # create dir
            os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
            with open(DATA_FILE, "x") as f:
                json.dump({}, f)
        except FileExistsError:
            pass
    
    def read_data(self):
        try:
            with open(DATA_FILE, "r") as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {}
    
    def read_by_key(self, key: str):
        return self.read_data().get(key, None)
        
    def write_data(self, data):
        with open(DATA_FILE, "w") as f:
            json.dump(data, f, indent=4)
        
    def write_by_key(self, key: str, data):
        db = self.read_data()
        db[key] = data
        self.write_data(db)

database = Database()

class Api:
    def __init__(self):
        self.resolve = dvr_script.scriptapp("Resolve")

    def reload_module(self):
        print("Reloading module...")
        self.resolve = dvr_script.scriptapp("Resolve")
        print("Reloaded")

    def check_resolve(self):
        status = self.resolve is not None
        print(f"Resolve is {'connected' if status else 'not connected'}")
        return status

    def get_fav_fonts(self):
        return database.read_data().get("fav_fonts", [])
    
    def add_fav_fonts(self, fonts: list[str]):
        font_in_db = self.get_fav_fonts()
        font_in_db.extend(fonts)
        font_in_db = list(set(font_in_db))
        database.write_by_key("fav_fonts", font_in_db)
        return self.get_fav_fonts()
    
    def remove_fav_fonts(self, fonts: list[str]):
        font_in_db = self.get_fav_fonts()
        for font in fonts:
            font_in_db.remove(font)
        database.write_by_key("fav_fonts", font_in_db)
        return self.get_fav_fonts()
    
    def add_font_group(self, group_name: str, fonts: list[str]):
        db = database.read_data()
        db.group[group_name] = fonts
        database.write_data(db)
        return db

    def remove_font_group(self, group_name: str):
        db = database.read_data()
        del db.group[group_name]
        database.write_data(db)
        return db

    def apply_font(self, font_name: str, font_style: str):
        change_font(self.resolve, font_name, font_style)


def set_timeline_item_value(resolve, timeline, timeline_item, font: str, font_style: str):
    try:
        comps = timeline_item.GetFusionCompByIndex(1)
        if comps:
            print(f'Apply {timeline_item.GetName()}/{font}({font_style})')
            is_in_fusion = resolve.GetCurrentPage() == "fusion"
            if not is_in_fusion:
                range = [timeline_item.GetStart(), timeline_item.GetEnd()]
                frame_rate = round(timeline.GetSetting('timelineFrameRate'), 0)
                current_times = timeline.GetCurrentTimecode().split(":")
                current_time = int(current_times[0]) * 60 * 60 * frame_rate + int(current_times[1]) * 60 * frame_rate + int(current_times[2]) * frame_rate + int(current_times[3])
                if current_time < range[0] or current_time > range[1]:
                    return
            toollist = comps.GetToolList(is_in_fusion, "TextPlus")
            if toollist:
                for idx in toollist:
                    toollist[idx].SetInput("Font", font)
                    toollist[idx].SetInput("Style", font_style)

    except Exception as e:
        print('[Error]', e)


def change_font(resolve, font_name: str, font_style):
    if not resolve:
        return
    project_manager = resolve.GetProjectManager()
    project = project_manager.GetCurrentProject()
    timeline = project.GetCurrentTimeline()
    page = resolve.GetCurrentPage()
    available_pages = ["cut", "edit", "fusion"]
    if page not in available_pages:
        print(f"Page {page} is not supported")
        return
    if not timeline:
        print("No timeline found")
        return
    tl_items = list()
    for i in range(1, timeline.GetTrackCount("subtitle") + 1):
        items = timeline.GetItemListInTrack("subtitle", i)
        tl_items.extend(items)
    for i in range(1, timeline.GetTrackCount("video") + 1):
        items = timeline.GetItemListInTrack("video", i)
        tl_items.extend(items)
    for item in tl_items:
        set_timeline_item_value(resolve, timeline, item, font_name, font_style)

def get_target_url():
    if env == 'dev':
        return 'http://localhost:5173'
    return './static/index.html'

def start_webview():
    print('start webview...')
    mimetypes.add_type("application/javascript", ".js")
    webview.create_window(
        'Davinci Font Toolkit', 
        get_target_url(), # replace with 'index.html'
        width=400, 
        height=700, 
        resizable=False, 
        js_api=Api(), 
        on_top=True
    )
    print('create window...')
    webview.start(debug=env == 'dev', private_mode=False)
    print('exit...')

if __name__ == '__main__':
    start_webview()
