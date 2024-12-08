import React from 'react';

import './Footer.scss';
import { fontStore } from '../store';
import { useCallback } from 'react';
import { debounce } from '../utils';

export default function Footer() {

  const {setSample} = fontStore.useConfig();

  const setSampleText = useCallback(debounce((text: string) => {
    setSample(text);
  }, 400), [])

  return (
    <div className="footer">
      <input type="text" placeholder="SampleText" onChange={(e) => {
        setSampleText(e.target.value)
      }} />
    </div>
  )
}
