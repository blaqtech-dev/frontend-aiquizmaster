import { useEffect, useRef } from "react";

import {
  ZegoUIKitPrebuilt,
} from "@zegocloud/zego-uikit-prebuilt";

export function VoiceChat({
  roomCode,
  user,
}) {

  const meetingRef =
    useRef(null);

useEffect(() => {

  if (!roomCode || !user)
    return;

  const appID =
    274588667;

  const serverSecret =
    "f7561cd5a66b32008805ed6e886d9b7f";

  const kitToken =

    ZegoUIKitPrebuilt.generateKitTokenForTest(

      appID,

      serverSecret,

      roomCode,

      user.id,

      user.user_metadata
        ?.username ||

      user.email ||

      "Player"
    );

  const zp =

    ZegoUIKitPrebuilt.create(
      kitToken
    );

  zp.joinRoom({

    container:
      meetingRef.current,

        showPreJoinView: false,

    sharedLinks: [],

    scenario: {

      mode:
        ZegoUIKitPrebuilt
          .GroupCall,
    },

    turnOnMicrophoneWhenJoining:
      true,

    turnOnCameraWhenJoining:
      false,

    showMyCameraToggleButton:
      false,

    showMyMicrophoneToggleButton:
      true,

    showAudioVideoSettingsButton:
      true,

    showScreenSharingButton:
      false,

    showTextChat:
      false,

    showUserList: false,

    maxUsers: 30,

    layout: "Auto",

    showLayoutButton: false,
  });

  return () => {

    zp.destroy();
  };

}, [roomCode, user]);

  return (

    <div
      ref={meetingRef}
      className="voice-chat-box"
    />

  );
}