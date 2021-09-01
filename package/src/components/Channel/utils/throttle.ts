/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef } from 'react';
import type { ThrottleSettings } from 'lodash';
import throttle from 'lodash/throttle';

export const lightThrottle = <T extends (...args: any) => any>(
  callback: T,
  ms = 500,
  option: ThrottleSettings = {
    leading: false,
    trailing: true,
  },
) => useRef(throttle(callback, ms, option)).current;
