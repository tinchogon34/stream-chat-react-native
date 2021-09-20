import { useHeaderHeight } from "@react-navigation/stack";
import React, { useContext, useEffect, useState } from "react";
import { Image, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AutoCompleteInput, Channel, Chat, MessageAvatar, MessageInput, MessageList, useAttachmentPickerContext, useMessageInputContext, useOverlayContext } from "stream-chat-react-native";
import { AppContext, ChannelScreenProps, chatClient, LocalAttachmentType, LocalChannelType, LocalCommandType, LocalEventType, LocalMessageType, LocalResponseType, LocalUserType, streami18n } from "./ChannelScreen";
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import Svg, { Path } from "react-native-svg";


const TopFloatingMessageAvatar = (): JSX.Element => (<MessageAvatar />)

export const SplitChannelScreen: React.FC<ChannelScreenProps> = ({ navigation }): JSX.Element => {
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
                    Input={SplitChannelMessageInput}
                    keyboardVerticalOffset={headerHeight}
                    MessageAvatar={() => (<TopFloatingMessageAvatar />)}
                    MessageHeader={({ message }): JSX.Element => (
                        <View style={styles.headerContainer}>
                            <Text style={styles.headerName}>{message?.user?.name}</Text>
                            <Text style={styles.headerMessageTime}>{formatDistanceToNow(new Date(message?.created_at ?? ""))}</Text>
                        </View>
                    )}
                    MessageFooter={() => null}
                    thread={thread}
                >
                    <View style={{ flex: 1 }}>
                        <View style={{ flex: 1 }}>
                            <Image
                                resizeMode={'cover'}
                                source={{ uri: 'https://i.ibb.co/rfx5PCr/Screenshot-2021-02-24-at-14-20-57.png' }}
                                style={{ height: '100%', width: '100%' }}
                            />
                        </View>
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

const SplitChannelMessageInput = () => {
    const MAX_CHARACTERS = 28;
    const [remainingCharacterCount, setRemainingCharacterCount] = useState<number>(0);

    const { sendMessage, text } = useMessageInputContext();

    useEffect(() => {
        setRemainingCharacterCount(MAX_CHARACTERS - text.length);
    }, [text]);

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <AutoCompleteInput additionalTextInputProps={{ style: styles.input }} />
            </View>
            <TouchableOpacity
                disabled={remainingCharacterCount < 0}
                onPress={sendMessage}
                style={styles.sendButtonContainer}
            >
                <SendMessageIcon />
                <Text style={styles.characterCount}>{remainingCharacterCount}</Text>
            </TouchableOpacity>
        </View>
    );
};

const SendMessageIcon = () => (
    <Svg fill='none' height={16} width={16}>
        <Path
            d='M8 4a1 1 0 01-1 1H1a1 1 0 00-1 1v2a1 1 0 001 1h6a1 1 0 011 1v2.586c0 .89 1.077 1.337 1.707.707l5.586-5.586a1 1 0 000-1.414L9.707.707C9.077.077 8 .523 8 1.414V4z'
            fill='#006CFF'
        />
    </Svg>
);

const styles = StyleSheet.create({
    characterCount: {
        fontSize: 11,
    },
    container: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
    },
    headerContainer: {
        flexDirection: 'row',
    },
    headerName: {
        color: "#0E1621",
        fontWeight: "600",
        fontSize: 14,
    },
    headerMessageTime: {
        color: "#8A898E",
        fontWeight: "400",
        fontSize: 12
    },
    input: {
        borderStyle: 'solid',
        height: '100%',
        paddingVertical: 0,
    },
    inputContainer: {
        borderColor: '#F2F2F2',
        borderRadius: 8,
        borderWidth: 1,
        flex: 8,
        height: 40,
        paddingHorizontal: 8,
        paddingVertical: 11,
    },
    sendButtonContainer: {
        alignItems: 'center',
        backgroundColor: '#F2F2F2',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        height: 40,
        justifyContent: 'center',
        marginLeft: 8,
        width: 40,
    },
});
