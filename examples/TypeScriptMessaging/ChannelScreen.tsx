import { StackNavigationProp, useHeaderHeight } from "@react-navigation/stack";
import React, { useContext, useEffect } from "react";
import { Platform, SafeAreaView, View } from "react-native";
import { Channel, Chat, MessageInput, MessageList, Streami18n, ThreadContextValue, useAttachmentPickerContext, useOverlayContext } from "stream-chat-react-native";
import { Channel as ChannelType, StreamChat } from 'stream-chat';

// Copied here for now to avoid circular references
export type LocalAttachmentType = Record<string, unknown>;
export type LocalChannelType = Record<string, unknown>;
export type LocalCommandType = string;
export type LocalEventType = Record<string, unknown>;
export type LocalMessageType = Record<string, unknown>;
export type LocalResponseType = Record<string, unknown>;
export type LocalUserType = Record<string, unknown>;
export type ChannelRoute = { Channel: undefined };
export type SplitChannelRoute = { SplitChannel: undefined };
export type ChannelListRoute = { ChannelList: undefined };
export type ThreadRoute = { Thread: undefined };
export type NavigationParamsList = ChannelRoute & SplitChannelRoute & ChannelListRoute & ThreadRoute;

export const streami18n = new Streami18n({
    language: 'en',
});

type AppContextType = {
    channel:
    | ChannelType<
        LocalAttachmentType,
        LocalChannelType,
        LocalCommandType,
        LocalEventType,
        LocalMessageType,
        LocalResponseType,
        LocalUserType
    >
    | undefined;
    setChannel: React.Dispatch<
        React.SetStateAction<
            | ChannelType<
                LocalAttachmentType,
                LocalChannelType,
                LocalCommandType,
                LocalEventType,
                LocalMessageType,
                LocalResponseType,
                LocalUserType
            >
            | undefined
        >
    >;
    setThread: React.Dispatch<
        React.SetStateAction<
            | ThreadContextValue<
                LocalAttachmentType,
                LocalChannelType,
                LocalCommandType,
                LocalEventType,
                LocalMessageType,
                LocalResponseType,
                LocalUserType
            >['thread']
            | undefined
        >
    >;
    thread:
    | ThreadContextValue<
        LocalAttachmentType,
        LocalChannelType,
        LocalCommandType,
        LocalEventType,
        LocalMessageType,
        LocalResponseType,
        LocalUserType
    >['thread']
    | undefined;
};
export const chatClient =
    StreamChat.getInstance<
        LocalAttachmentType,
        LocalChannelType,
        LocalCommandType,
        LocalEventType,
        LocalMessageType,
        LocalResponseType,
        LocalUserType
    >('q95x9hkbyd6p');
export type ChannelScreenProps = {
    navigation: StackNavigationProp<NavigationParamsList, 'Channel'>;
};

export const AppContext = React.createContext({} as AppContextType);
export const ChannelScreen: React.FC<ChannelScreenProps> = ({ navigation }) => {
    const { channel, setThread, thread } = useContext(AppContext);
    const headerHeight = useHeaderHeight();
    const { setTopInset } = useAttachmentPickerContext();
    const { overlay } = useOverlayContext();

    useEffect(() => {
        navigation.setOptions({
            gestureEnabled: Platform.OS === 'ios' && overlay === 'none',
        });
    }, [overlay]);

    useEffect(() => {
        setTopInset(headerHeight);
    }, [headerHeight]);

    return (
        <SafeAreaView>
            <Chat client={chatClient} i18nInstance={streami18n}>
                <Channel
                    channel={channel}
                    forceAlignMessages='left'
                    keyboardVerticalOffset={headerHeight}
                    thread={thread}
                >
                    <View style={{ flex: 1 }}>
                        <MessageList<
                            LocalAttachmentType,
                            LocalChannelType,
                            LocalCommandType,
                            LocalEventType,
                            LocalMessageType,
                            LocalResponseType,
                            LocalUserType
                        >
                            onThreadSelect={(selectedThread) => {
                                setThread(selectedThread);
                                if (channel?.id) {
                                    navigation.navigate('Thread');
                                }
                            }}
                        />
                        <MessageInput />
                    </View>
                </Channel>
            </Chat>
        </SafeAreaView>
    );
};
