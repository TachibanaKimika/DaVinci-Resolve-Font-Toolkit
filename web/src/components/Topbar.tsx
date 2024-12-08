import React from 'react';
import cs from 'classnames';
import { fontStore } from '../store';
import Refresh from './Icon/RefreshIcon';

import './Topbar.scss';
import { useMemo } from 'react';
import { useCallback } from 'react';
import { debounce } from '../utils';

export default function Topbar() {

  const {filterFav, setFilterFav, resolve, reloadResolve} = fontStore.useConfig();
  const [loading, setLoading] = React.useState(false);

  const reloadResolveFunc = async () => {
    setLoading(true);
    await reloadResolve();
    setLoading(false);
  }

  const setSearchFontText = useCallback(debounce((text: string) => {
    fontStore.searchFontText = text;
    fontStore.asyncEmit('update:config:searchFontText');
  }, 400), [])

  return (
    <div className="topbar">
      <div className="filter-fav">
        Favorite <input type="checkbox" checked={filterFav} onChange={(e) => {
          setFilterFav(e.target.checked)
        }} />
      </div>
      <div className="search-font-input">
        <input type="text" placeholder="Search font" onChange={(e) => {
          setSearchFontText(e.target.value)
        }} />
      </div>
      <div className="davinci-instance-status">
        <div title="davinci-status" className={cs("davinci-status-icon", loading ? 'yellow' : resolve ? 'green' : 'red')} />
        <Refresh fill="#ccc" className="icon" onClick={() => reloadResolveFunc()} />
      </div>
    </div>
  )
}
