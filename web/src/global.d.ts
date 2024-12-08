export interface PyWebviewApis {
  get_fonts: () => Promise<string[]>;
  get_fav_fonts: () => Promise<string[]>;
  add_fav_fonts: (list: string[]) => Promise<string[]>;
  remove_fav_fonts: (list: string[]) => Promise<string[]>;
  apply_font: (fontName: string, style: string) => Promise<void>;
  check_resolve: () => Promise<boolean>;
  reload_module: () => Promise<void>;
}


declare global {
  export interface Window {
    pywebview: {
      api: PyWebviewApis;
    };
    queryLocalFonts: () => Promise<FontData[]>;
  }
  
  export interface FontData {
    postscriptName: string;
    fullName: string;
    family: string;
    style: string;
  }

  export interface FontItem {
    fontName: string;
    style: string[];
    isFavorite: boolean;
  }
  
  export interface FontGroup {
    groupName: string;
    fonts: FontItem[];
  }
}
