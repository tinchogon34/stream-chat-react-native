import React from 'react';
import {
  Image,
  ImageStyle,
  Linking,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import type { Attachment } from 'stream-chat';

import {
  MessageContextValue,
  useMessageContext,
} from '../../contexts/messageContext/MessageContext';
import {
  MessagesContextValue,
  useMessagesContext,
} from '../../contexts/messagesContext/MessagesContext';
import { useTheme } from '../../contexts/themeContext/ThemeContext';
import type { DefaultStreamChatGenerics } from '../../types/types';
import { makeImageCompatibleUrl } from '../../utils/utils';

const styles = StyleSheet.create({
  authorName: { fontSize: 14.5, fontWeight: '600' },
  authorNameContainer: {
    borderTopRightRadius: 15,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  authorNameFooter: {
    fontSize: 14.5,
    fontWeight: '600',
    padding: 8,
  },
  authorNameMask: {
    bottom: 0,
    left: 8,
    position: 'absolute',
  },
  cardCover: {
    borderRadius: 8,
    height: 140,
    marginHorizontal: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  container: {
    overflow: 'hidden',
    width: 256,
  },
  description: {
    fontSize: 12,
    marginHorizontal: 8,
  },
  title: {
    fontSize: 12,
    marginHorizontal: 8,
  },
});

const goToURL = (url?: string) => {
  if (!url) return;
  Linking.canOpenURL(url).then((supported) => {
    if (supported) {
      Linking.openURL(url);
    } else {
      console.log(`Don't know how to open URI: ${url}`);
    }
  });
};

export type CardPropsWithContext<
  StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics,
> = Attachment<StreamChatGenerics> &
  Pick<
    MessageContextValue<StreamChatGenerics>,
    'onLongPress' | 'onPress' | 'onPressIn' | 'preventPress'
  > &
  Pick<
    MessagesContextValue<StreamChatGenerics>,
    'additionalTouchableProps' | 'CardCover' | 'CardFooter' | 'CardHeader'
  > & {
    channelId: string | undefined;
    messageId: string | undefined;
    styles?: Partial<{
      authorName: StyleProp<TextStyle>;
      authorNameContainer: StyleProp<ViewStyle>;
      authorNameFooter: StyleProp<TextStyle>;
      authorNameFooterContainer: StyleProp<ViewStyle>;
      authorNameMask: StyleProp<ViewStyle>;
      cardCover: StyleProp<ImageStyle>;
      cardFooter: StyleProp<ViewStyle>;
      container: StyleProp<ViewStyle>;
      description: StyleProp<TextStyle>;
      title: StyleProp<TextStyle>;
    }>;
  };

const CardWithContext = <
  StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics,
>(
  props: CardPropsWithContext<StreamChatGenerics>,
) => {
  const {
    additionalTouchableProps,
    author_name,
    CardCover,
    CardFooter,
    CardHeader,
    image_url,
    og_scrape_url,
    onLongPress,
    onPress,
    onPressIn,
    preventPress,
    styles: stylesProp = {},
    text,
    thumb_url,
    title,
  } = props;

  const {
    theme: {
      colors: { accent_blue, black, blue_alice, transparent },
      messageSimple: {
        card: {
          authorName,
          authorNameContainer,
          authorNameFooter,
          authorNameFooterContainer,
          authorNameMask,
          container,
          cover,
          footer: { description, title: titleStyle, ...footerStyle },
          noURI,
        },
      },
    },
  } = useTheme();

  const uri = image_url || thumb_url;

  const defaultOnPress = () => goToURL(og_scrape_url || uri);

  return (
    <TouchableOpacity
      disabled={preventPress}
      onLongPress={(event) => {
        if (onLongPress) {
          onLongPress({
            emitter: 'card',
            event,
          });
        }
      }}
      onPress={(event) => {
        if (onPress) {
          onPress({
            defaultHandler: defaultOnPress,
            emitter: 'card',
            event,
          });
        }
      }}
      onPressIn={(event) => {
        if (onPressIn) {
          onPressIn({
            defaultHandler: defaultOnPress,
            emitter: 'card',
            event,
          });
        }
      }}
      style={[styles.container, container, stylesProp.container]}
      testID='card-attachment'
      {...additionalTouchableProps}
    >
      {CardHeader && <CardHeader {...props} />}
      {CardCover && <CardCover {...props} />}
      {uri && !CardCover && (
        <View>
          <Image
            resizeMode='cover'
            source={{ uri: makeImageCompatibleUrl(uri) }}
            style={[styles.cardCover, cover, stylesProp.cardCover]}
          />
          {author_name && (
            <View style={[styles.authorNameMask, authorNameMask, stylesProp.authorNameMask]}>
              <View
                style={[
                  styles.authorNameContainer,
                  { backgroundColor: blue_alice },
                  authorNameContainer,
                  stylesProp.authorNameContainer,
                ]}
              >
                <Text
                  style={[
                    styles.authorName,
                    { color: accent_blue },
                    authorName,
                    stylesProp.authorName,
                  ]}
                >
                  {author_name}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}
      {CardFooter ? (
        <CardFooter {...props} />
      ) : (
        <View style={[styles.cardFooter, footerStyle, stylesProp.cardFooter]}>
          <View
            style={[
              authorNameFooterContainer,
              { backgroundColor: transparent },
              !uri ? { borderLeftColor: accent_blue, ...noURI } : {},
              stylesProp.authorNameFooterContainer,
            ]}
          >
            {!uri && author_name && (
              <Text
                style={[
                  styles.authorNameFooter,
                  { color: accent_blue },
                  authorNameFooter,
                  stylesProp.authorNameFooter,
                ]}
              >
                {author_name}
              </Text>
            )}
            {title && (
              <Text
                numberOfLines={1}
                style={[styles.title, { color: black }, titleStyle, stylesProp.title]}
              >
                {title}
              </Text>
            )}
            {text && (
              <Text
                numberOfLines={3}
                style={[styles.description, { color: black }, description, stylesProp.description]}
              >
                {text}
              </Text>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const MemoizedCard = React.memo(CardWithContext, () => true) as typeof CardWithContext;

export type CardProps<
  StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics,
> = Attachment<StreamChatGenerics> &
  Partial<
    Pick<MessageContextValue<StreamChatGenerics>, 'onLongPress' | 'onPress' | 'onPressIn'> &
      Pick<
        MessagesContextValue<StreamChatGenerics>,
        'additionalTouchableProps' | 'CardCover' | 'CardFooter' | 'CardHeader'
      >
  >;

/**
 * UI component for card in attachments.
 */
export const Card = <
  StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics,
>(
  props: CardProps<StreamChatGenerics>,
) => {
  const { message, onLongPress, onPress, onPressIn, preventPress } =
    useMessageContext<StreamChatGenerics>();
  const { additionalTouchableProps, CardCover, CardFooter, CardHeader } =
    useMessagesContext<StreamChatGenerics>();

  return (
    <MemoizedCard
      {...{
        additionalTouchableProps,
        CardCover,
        CardFooter,
        CardHeader,
        channelId: message.cid,
        messageId: message.id,
        onLongPress,
        onPress,
        onPressIn,
        preventPress,
      }}
      {...props}
    />
  );
};

Card.displayName = 'Card{messageSimple{card}}';
