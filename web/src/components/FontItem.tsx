import React from 'react'
import {fontStore} from '../store';

import './FontItem.scss';

interface FontItemProps {
  font: FontItem;
  sample?: string;
}

export default function FontItemComp(props: FontItemProps) {

  const [currentStyle, setCurrentStyle] = React.useState<string>();

  const favClick = (key: string, isCancel: boolean) => {
    if (isCancel) {
      fontStore.removeFavFont([key]);
    } else {
      fontStore.addFavFont([key]);
    }
  }

  const applyFont = (style?: string) => {
    const hasRegular = props.font.style?.includes('Regular');
    const fontStyle = style || (hasRegular ? 'Regular' : props.font.style[0]);
    window.pywebview.api.apply_font(props.font.fontName, fontStyle);
  }

  return (
    
    <div className="font-item" title={props.font.fontName}>
      <div className="font-basic">
        <div 
          className="font-item-left" 
          style={{ fontFamily: props.font.fontName, fontStyle: currentStyle }} 
          onClick={() => {
            applyFont();
          }
        }>
          <span className="font-name">{props.font.fontName}</span>
          <span className="font-sample">{props.sample || 'sample'}</span>
        </div>
        <div className="font-item-right">
          <span className="font-item-fav-icon" onClick={() => {
            favClick(props.font.fontName, !!props.font.isFavorite);
          }}>{props.font.isFavorite ? '❤️' : '🤍'}</span>
        </div>
      </div>
      {props.font.style?.length > 1 && <div className="font-foot">
        {props.font.style.map(i => (
          <div 
            key={i} 
            onMouseEnter={() => {
              setCurrentStyle(i);
            }}
            onMouseLeave={() => {
              setCurrentStyle(undefined);
            }}
            className="font-style-btn" 
            onClick={() => {
              applyFont(i);
            }}
          >{i}</div>
        ))}
      </div>}
    </div>
  )
}
