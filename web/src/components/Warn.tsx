import React from 'react';

import './Warn.scss';

interface WarnProps {
  text: string;
}

export default function Warn(props: WarnProps) {
  return (
    <div className="warn">
      <div className="warn-text">
        {props.text}
      </div>
    </div>
  )
}
