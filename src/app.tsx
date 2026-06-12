import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { initMockData } from '@/services/holeService';
import './app.scss';

function App(props) {
  useEffect(() => {
    initMockData();
  }, []);

  useDidShow(() => {
    initMockData();
  });

  useDidHide(() => {});

  return props.children;
}

export default App;
