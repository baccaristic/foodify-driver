declare module 'expo-av' {
  export namespace Audio {
    type SoundSource = number | string | { uri: string };
    type SoundStatus = {
      isLooping?: boolean;
      volume?: number;
    };

    class Sound {
      static createAsync(
        source: SoundSource,
        initialStatus?: SoundStatus,
      ): Promise<{ sound: Sound }>;
      stopAsync(): Promise<void>;
      unloadAsync(): Promise<void>;
      replayAsync(): Promise<void>;
    }

    function setAudioModeAsync(mode: {
      allowsRecordingIOS?: boolean;
      staysActiveInBackground?: boolean;
      playsInSilentModeIOS?: boolean;
      shouldDuckAndroid?: boolean;
      playThroughEarpieceAndroid?: boolean;
      interruptionModeAndroid?: number;
      interruptionModeIOS?: number;
    }): Promise<void>;
  }
}
