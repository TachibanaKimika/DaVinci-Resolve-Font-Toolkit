import { useEffect, useMemo, useState } from "react";
import { apiStatus, EventEmitter } from "./base";

class FontStore extends EventEmitter {
  fontList: Array<{font: string, style: string[]}> | undefined = undefined;
  favFontList: string[] | undefined = undefined;
  resolveLoaded: boolean = false;

  constructor() {
    super();

    apiStatus.on('loaded', () => {
      this.init();
    })
  }

  init() {
    return new Promise<void>(res => {
      if (apiStatus.status === 'loaded') {
        this.getFontList();
        this.getFavFonts();
        window.pywebview.api.check_resolve().then(res => {
          this.resolveLoaded = res;
          this.asyncEmit('resolveLoaded');
        });
        res();
        return;
      } else {
        apiStatus.once('loaded', () => {
          this.getFontList();
          this.getFavFonts();
          res();
        })
      }
    })
  }

  getFontData(): FontItem[] {
    return (this.fontList || []).map(i => ({ fontName: i.font, style: i.style, isFavorite: !!this.favFontList?.includes(i.font) }));
  }

  async getFontList() {
    if (!this.fontList) {
      const data = await window.queryLocalFonts();
      const fontMap: Record<string, string[]> = {};
      data.forEach(i => {
        if (!fontMap[i.family]) {
          fontMap[i.family] = [];
        }
        fontMap[i.family].push(i.style);
      })
      // const fontSet = new Set<string>(data.map(i => i.family));
      this.fontList = Object.entries(fontMap).map(([font, style]) => ({ font, style: Array.from(new Set(style)) }));
      this.asyncEmit('update')
      return this.fontList;
    }
    return this.fontList;
  }

  async getFavFonts() {
    if (!this.favFontList) {
      const fontList = await window.pywebview.api.get_fav_fonts();
      this.favFontList = fontList;
      this.asyncEmit('update')
      return fontList;
    }

    return this.favFontList;
  }

  async addFavFont(fonts: string[]) {
    const fontList = await window.pywebview.api.add_fav_fonts(fonts);
    this.favFontList = fontList;
    this.asyncEmit('update')
    return fontList;
  }

  async removeFavFont(fonts: string[]) {
    const fontList = await window.pywebview.api.remove_fav_fonts(fonts);
    this.favFontList = fontList;
    this.asyncEmit('update')
    return fontList;
  }

  useLiveFontList(filter?: { groupName?: string, fav?: boolean }) {
    const [fontList, setFontList] = useState<FontItem[]>([]);
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

    useEffect(() => {
      const dispose = this.on('update', () => {
        setFontList(this.getFontData())
        setStatus('loaded')
      });

      this.init().then(() => {
        setFontList(this.getFontData())
        setStatus('loaded')
      });

      return () => {
        dispose()
      }
    }, [])

    const filterdFontList = useMemo(() => {
      if (!filter) {
        return fontList;
      }
    }, [fontList. filter])

    return { fontList, status }

  }

  filterFav: boolean = false;
  filterGroup: string | undefined = undefined;
  sampleText: string | undefined = undefined;
  searchFontText: string = '';

  useConfig() {
    const [filterFav, setRawFilterFav] = useState(this.filterFav);
    const [filterGroup, setRawFilterGroup] = useState<string | undefined>(this.filterGroup);
    const [sample, setRawSample] = useState<string | undefined>(this.sampleText);
    const [resolve, setResolve] = useState(this.resolveLoaded);
    const [searchFontText, setSearchFontText] = useState(this.searchFontText);

    const setFilterFav = (fav: boolean) => {
      this.filterFav = fav;
      setRawFilterFav(this.filterFav);
      this.asyncEmit('update:config:fav')
    }

    const setFilterGroup = (group: string | undefined) => {
      this.filterGroup = group;
      setRawFilterGroup(this.filterGroup);
      this.asyncEmit('update:config:group')
    }

    const setSample = (sample: string | undefined) => {
      this.sampleText = sample;
      this.asyncEmit('update:config:sampleText')
      setRawSample(sample);
    }

    const reloadResolve = async () => {
      await window.pywebview.api.reload_module();
      const res = await window.pywebview.api.check_resolve();
      this.resolveLoaded = res;
      this.asyncEmit('resolveLoaded');
    }

    useEffect(() => {
      const disposes = [
        this.on('update:config:fav', () => {
          setRawFilterFav(this.filterFav)
        }),
        this.on('update:config:group', () => {
          setRawFilterGroup(this.filterGroup)
        }),
        this.on('update:config:sampleText', () => {
          setRawSample(this.sampleText)
        }),
        this.on('resolveLoaded', () => {
          setResolve(this.resolveLoaded)
        }),
        this.on('update:config:searchFontText', () => {
          setSearchFontText(this.searchFontText)
        })
      ];

      return () => {
        disposes.map(func => func())
      }
    }, []);

    return {
      filterFav,
      setFilterFav,
      filterGroup,
      sample,
      setSample,
      setFilterGroup,
      resolve,
      reloadResolve,
      searchFontText
    }
  }
}

export const fontStore = new FontStore();