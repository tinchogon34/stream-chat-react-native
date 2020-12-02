import React, { useEffect, useState } from 'react';
import {
  FlatList,
  ImageBackground,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import CameraRoll, {
  PhotoIdentifier,
} from '@react-native-community/cameraroll';
import { TouchableOpacity } from 'react-native-gesture-handler';
// @ts-expect-error
import Keyboard from 'react-native-ui-lib/keyboard';

import { Check } from '../../src/v2';

const KeyboardRegistry = Keyboard.KeyboardRegistry;

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 8,
    width: 24,
  },
  container: {
    flex: 1,
  },
  image: {
    margin: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: '#00000080',
  },
});

type PageInfo = {
  has_next_page: boolean;
  start_cursor?: string;
  end_cursor?: string;
};

type KeyboardImageProps = {
  item: PhotoIdentifier;
  keyboardHeight: number;
  selected?: boolean;
};

const KeyboardImage: React.FC<KeyboardImageProps> = (props) => {
  const { item, keyboardHeight, selected } = props;
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        KeyboardRegistry.onItemSelected(`CameraRollKeyboard`, { test: true })
      }
    >
      <ImageBackground
        resizeMode={'cover'}
        style={[
          styles.image,
          {
            height: keyboardHeight / 2 - 2,
            width: keyboardHeight / 2 - 2,
          },
        ]}
        source={{ uri: item.node.image.uri }}
      >
        {selected && (
          <View style={styles.overlay}>
            <View style={styles.circle}>
              <Check />
            </View>
          </View>
        )}
      </ImageBackground>
    </TouchableOpacity>
  );
};

export const CameraRollKeyboard: React.FC<{ bottom: number }> = ({
  bottom,
}) => {
  const [keyboardHeight, setKeyboardHeight] = useState(360);
  const [images, setImages] = useState<PhotoIdentifier[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo>();
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const numColumns = Math.ceil(images.length / 2);

  const loadMoreImages = async () => {
    if (!loadingMore && pageInfo?.has_next_page !== false) {
      setLoadingMore(true);
      try {
        const imageData = await CameraRoll.getPhotos({
          first: 60,
          assetType: 'Photos',
          include: ['filename', 'imageSize'],
          after: pageInfo?.end_cursor,
        });
        setImages([...images, ...imageData.edges]);
        setPageInfo({
          ...imageData.page_info,
          start_cursor: pageInfo?.start_cursor,
        });
      } catch (error) {
        console.log(error);
      }
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadMoreImages();
  }, []);

  return (
    <View style={[styles.container, { marginBottom: bottom }]}>
      <ScrollView
        onLayout={(event) => setKeyboardHeight(event.nativeEvent.layout.height)}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        horizontal
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <FlatList
          scrollEnabled={false}
          style={{ height: keyboardHeight }}
          key={numColumns}
          keyExtractor={(item) => item.node.image.uri}
          contentContainerStyle={{ alignSelf: 'flex-start' }}
          numColumns={numColumns}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          data={images}
          onEndReached={loadMoreImages}
          renderItem={({ item }) => (
            <KeyboardImage item={item} keyboardHeight={keyboardHeight} />
          )}
        />
      </ScrollView>
    </View>
  );
};

KeyboardRegistry.registerKeyboard(
  'CameraRollKeyboard',
  () => CameraRollKeyboard,
);
