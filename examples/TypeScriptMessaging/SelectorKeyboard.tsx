import React from 'react';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// @ts-expect-error
import Keyboard from 'react-native-ui-lib/keyboard';
import { Camera, Folder, Picture } from '../../src/v2';
import './CameraRollKeyboard';

const KeyboardAccessoryView = Keyboard.KeyboardAccessoryView;
const KeyboardRegistry = Keyboard.KeyboardRegistry;

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
  keyboardHeader: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    flexDirection: 'row',
    height: 52,
    paddingHorizontal: 6,
  },
  keyboardHeaderIcon: {
    marginHorizontal: 12,
  },
});

type Props = {
  inputRef: React.MutableRefObject<TextInput | null>;
  setCurrentKeyboard: React.Dispatch<React.SetStateAction<string | undefined>>;
  currentKeyboard?: string;
};

export const SelectorKeyboard: React.FC<Props> = (props) => {
  const { currentKeyboard, inputRef, setCurrentKeyboard } = props;
  const { bottom } = useSafeAreaInsets();
  const [selectedKeyboard, setSelectedKeyboard] = useState<
    'photo' | 'attachment'
  >('photo');

  return (
    <>
      {currentKeyboard && (
        <View style={styles.keyboardHeader}>
          <TouchableOpacity onPress={() => setSelectedKeyboard('photo')}>
            <Picture
              pathFill={
                selectedKeyboard === 'photo'
                  ? 'rgba(0,108,255,1)'
                  : 'rgba(0,0,0,1)'
              }
              style={[styles.keyboardHeaderIcon]}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedKeyboard('attachment')}>
            <Folder
              pathFill={
                selectedKeyboard === 'attachment'
                  ? 'rgba(0,108,255,1)'
                  : 'rgba(0,0,0,1)'
              }
              style={[styles.keyboardHeaderIcon]}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Camera
              pathFill={'rgba(0,0,0,1)'}
              style={[styles.keyboardHeaderIcon]}
            />
          </TouchableOpacity>
        </View>
      )}
      <KeyboardAccessoryView
        kbInputRef={inputRef}
        kbComponent={currentKeyboard}
        kbInitialProps={{ bottom }}
        onItemSelected={(a, b) => console.log(a, b)}
        onKeyboardResigned={() => {
          setCurrentKeyboard(undefined);
        }}
        onRequestShowKeyboard={(id: string) => {
          setCurrentKeyboard(id);
        }}
        useSafeArea={false}
      />
    </>
  );
};
