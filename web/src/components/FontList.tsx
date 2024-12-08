import React, { useCallback, useEffect } from 'react'
import { getFonts } from '../apis'
import {fontStore} from '../store';

import './FontList.scss';
import Warn from './Warn';
import FontItemComp from './FontItem';

export default function FontList() {

  const {fontList, status} = fontStore.useLiveFontList();
  const {filterFav, searchFontText, sample} = fontStore.useConfig();

  if (status === 'loading' || !fontList.length) {
    return <Warn text="loading..." />
  }

  if (status === 'error') {
    return <Warn text="error" />
  }

  return (
    <div className="font-list">
      {fontList.filter((i => {
        let flag = true;
        if (filterFav) {
          flag = flag && i.isFavorite;
        }
        if (searchFontText) {
          flag = flag && i.fontName.toUpperCase().includes(searchFontText.toUpperCase());
        }
        return flag;
      })).map((i, idx) => (
        <FontItemComp font={i} key={i.fontName} sample={sample} />
      ))}
    </div>
  )
}
