import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  LogBox,
  Platform,
  SafeAreaView,
  useColorScheme,
  View,
} from 'react-native';
import { DarkTheme, DefaultTheme, NavigationContainer, RouteProp } from '@react-navigation/native';
import {
  createStackNavigator,
  StackNavigationProp,
  useHeaderHeight,
} from '@react-navigation/stack';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChannelSort, Channel as ChannelType } from 'stream-chat';
import {
  Channel,
  ChannelList,
  Chat,
  OverlayProvider,
  Thread,
  ThreadContextValue,
  useOverlayContext,
} from 'stream-chat-react-native';

import { useStreamChatTheme } from './useStreamChatTheme';
import { AppContext, ChannelScreen, chatClient, LocalAttachmentType, LocalChannelType, LocalCommandType, LocalEventType, LocalMessageType, LocalResponseType, LocalUserType, streami18n } from './ChannelScreen';
import { SplitChannelScreen } from './SplitChannelScreen';

LogBox.ignoreAllLogs(true);

// If true, show the split channel view, rather than the regular
// channel view.
const DEBUG_SPLIT_CHANNEL = true;


const userToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoicm9uIn0.eRVjxLvd4aqCEHY_JRa97g6k7WpHEhxL7Z4K4yTot1c';
const user = {
  id: 'ron',
};

const filters = {
  example: 'example-apps',
  members: { $in: ['ron'] },
  type: 'messaging',
};
const sort: ChannelSort<LocalChannelType> = { last_message_at: -1 };
const options = {
  presence: true,
  state: true,
  watch: true,
};

/**
 * Start playing with streami18n instance here:
 * Please refer to description of this PR for details: https://github.com/GetStream/stream-chat-react-native/pull/150
 */

type ChannelListScreenProps = {
  navigation: StackNavigationProp<NavigationParamsList, 'ChannelList'>;
};

const ChannelListScreen: React.FC<ChannelListScreenProps> = ({ navigation }) => {
  const { setChannel } = useContext(AppContext);

  const memoizedFilters = useMemo(() => filters, []);

  return (
    <Chat client={chatClient} i18nInstance={streami18n}>
      <View style={{ height: '100%' }}>
        <ChannelList<
          LocalAttachmentType,
          LocalChannelType,
          LocalCommandType,
          LocalEventType,
          LocalMessageType,
          LocalResponseType,
          LocalUserType
        >
          filters={memoizedFilters}
          onSelect={(channel) => {
            setChannel(channel);
            const channelView = DEBUG_SPLIT_CHANNEL ? 'SplitChannel' : 'Channel';
            navigation.navigate(channelView);
          }}
          options={options}
          sort={sort}
        />
      </View>
    </Chat>
  );
};




type ThreadScreenProps = {
  navigation: StackNavigationProp<ThreadRoute, 'Thread'>;
  route: RouteProp<ThreadRoute, 'Thread'>;
};

const ThreadScreen: React.FC<ThreadScreenProps> = ({ navigation }) => {
  const { channel, setThread, thread } = useContext(AppContext);
  const headerHeight = useHeaderHeight();
  const { overlay } = useOverlayContext();

  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: Platform.OS === 'ios' && overlay === 'none',
    });
  }, [overlay]);

  return (
    <SafeAreaView>
      <Chat client={chatClient} i18nInstance={streami18n}>
        <Channel channel={channel} keyboardVerticalOffset={headerHeight} thread={thread}>
          <View
            style={{
              flex: 1,
              justifyContent: 'flex-start',
            }}
          >
            <Thread<
              LocalAttachmentType,
              LocalChannelType,
              LocalCommandType,
              LocalEventType,
              LocalMessageType,
              LocalResponseType,
              LocalUserType
            >
              onThreadDismount={() => setThread(null)}
            />
          </View>
        </Channel>
      </Chat>
    </SafeAreaView>
  );
};

type ChannelRoute = { Channel: undefined };
type SplitChannelRoute = { SplitChannel: undefined };
type ChannelListRoute = { ChannelList: undefined };
type ThreadRoute = { Thread: undefined };
type NavigationParamsList = ChannelRoute & SplitChannelRoute & ChannelListRoute & ThreadRoute;

const Stack = createStackNavigator<NavigationParamsList>();



const App = () => {
  const colorScheme = useColorScheme();
  const { bottom } = useSafeAreaInsets();
  const theme = useStreamChatTheme();

  const [channel, setChannel] =
    useState<
      ChannelType<
        LocalAttachmentType,
        LocalChannelType,
        LocalCommandType,
        LocalEventType,
        LocalMessageType,
        LocalResponseType,
        LocalUserType
      >
    >();
  const [clientReady, setClientReady] = useState(false);
  const [thread, setThread] =
    useState<
      ThreadContextValue<
        LocalAttachmentType,
        LocalChannelType,
        LocalCommandType,
        LocalEventType,
        LocalMessageType,
        LocalResponseType,
        LocalUserType
      >['thread']
    >();

  useEffect(() => {
    const setupClient = async () => {
      await chatClient.connectUser(user, userToken);

      return setClientReady(true);
    };

    setupClient();
  }, []);

  return (
    <NavigationContainer
      theme={{
        colors: {
          ...(colorScheme === 'dark' ? DarkTheme : DefaultTheme).colors,
          background: theme.colors?.white_snow || '#FCFCFC',
        },
        dark: colorScheme === 'dark',
      }}
    >
      <AppContext.Provider value={{ channel, setChannel, setThread, thread }}>
        <OverlayProvider<
          LocalAttachmentType,
          LocalChannelType,
          LocalCommandType,
          LocalEventType,
          LocalMessageType,
          LocalResponseType,
          LocalUserType
        >
          bottomInset={bottom}
          i18nInstance={streami18n}
          value={{ style: theme }}
        >
          {clientReady && (
            <Stack.Navigator
              initialRouteName='ChannelList'
              screenOptions={{
                headerTitleStyle: { alignSelf: 'center', fontWeight: 'bold' },
              }}
            >
              <Stack.Screen
                component={ChannelScreen}
                name='Channel'
                options={() => ({
                  headerBackTitle: 'Back',
                  headerRight: () => <></>,
                  headerTitle: channel?.data?.name,
                })}
              />
              <Stack.Screen
                component={SplitChannelScreen}
                name='SplitChannel'
                options={() => ({
                  headerBackTitle: 'Back',
                  headerRight: () => <></>,
                  headerTitle: channel?.data?.name,
                })}
              />
              <Stack.Screen
                component={ChannelListScreen}
                name='ChannelList'
                options={{ headerTitle: 'Channel List' }}
              />
              <Stack.Screen
                component={ThreadScreen}
                name='Thread'
                options={() => ({ headerLeft: () => <></> })}
              />
            </Stack.Navigator>
          )}
        </OverlayProvider>
      </AppContext.Provider>
    </NavigationContainer>
  );
};

export default () => {
  const theme = useStreamChatTheme();

  return (
    <SafeAreaProvider style={{ backgroundColor: theme.colors?.white_snow || '#FCFCFC' }}>
      <App />
    </SafeAreaProvider>
  );
};
