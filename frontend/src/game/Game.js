import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import styles from './game.module.css';
import { Volume2, VolumeX } from 'lucide-react';

export default function Game() {
  const [scene, setScene] = useState(null);
  const [choices, setChoices] = useState([]);
  const [buttonWidth, setButtonWidth] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [showIntro, setShowIntro] = useState(true);
  const [introStarted, setIntroStarted] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [sceneHistory, setSceneHistory] = useState([]);

  const buttonRefs = useRef([]);
  const audioRef = useRef(null);

  useEffect(() => {
    const redirected = sessionStorage.getItem("skipIntroOnce");
    const redirectedagain = sessionStorage.getItem("changeBackgroundImage");
    const redirectmusic = sessionStorage.getItem("startMusicAgain");
    if (redirected) {
      setShowIntro(false);
    }
    if (redirectedagain) {
      setBackgroundImage(`/images/gamestands.jpg`);
    }
    if (redirectmusic) {
      playAudio(`/audio/start.mp3`);
    }
  }, []);

  useEffect(() => {
    const listener = (e) => {
      if (e.detail) {
        loadScene(e.detail);
      }
    };
    window.addEventListener("loadScene", listener);
    return () => window.removeEventListener("loadScene", listener);
  }, []);

  useEffect(() => {
    if (backgroundImage) {
      const img = new Image();
      img.onload = () => {
        setButtonWidth(img.width);
      };
      img.src = backgroundImage;
    }
  }, [backgroundImage]);

  useEffect(() => {
    if (!showIntro) {
      const redirected = sessionStorage.getItem("skipIntroOnce");
      const wasBeach = sessionStorage.getItem("isBeach");
     if (redirected && wasBeach === "true") {
  sessionStorage.removeItem("skipIntroOnce");
  sessionStorage.removeItem("isBeach");
  loadScene("beachWalk");
  setBackgroundImage("/images/beachWalk.jpg")
} else if (redirected) {
  sessionStorage.removeItem("skipIntroOnce");
  sessionStorage.removeItem("isBeach");
  loadScene("GameStands");
} else {
  loadScene("start");
}}
  }, [showIntro]);

  useEffect(() => {
    if (buttonRefs.current.length > 0) {
      const widths = buttonRefs.current.map(ref => ref?.offsetWidth || 0);
      const maxWidth = Math.max(...widths);
      setButtonWidth(maxWidth);
    }
  }, [choices]);

  const playAudio = async (src) => {
    if (!audioRef.current || !src) return;

    try {
      audioRef.current.pause();
      audioRef.current.src = src;
      audioRef.current.load();
      audioRef.current.volume = isMuted ? 0 : 0.08;

      await audioRef.current.play();
      console.log(`🎵 Playing: ${src}`);
      setCurrentAudio(src);
    } catch (e) {
      console.error("Autoplay error:", e);
    }
  };

  const handleChoiceClick = (choice) => {
    if (choice.action?.startsWith("changeBg_")) {
      const bgName = choice.action.replace("changeBg_", "");
      setBackgroundImage(`/images/${bgName}.jpg`);
    }

    if (choice.action === "loadGame_findTheKeys") {
      window.location.href = "/findthekeys";
      return;
    }

       if (choice.action === "loadGame_SandTicTacToe") {
      window.location.href = "/tictactoe";
      return;
    }
    if (choice.action === "loadGame_Match4") {
      window.location.href = "/match4";
      return;
    }

    loadScene(choice.next_scene);
  };

  const loadScene = async (id, isBackNavigation = false) => {
    try {
      if (!isBackNavigation && scene?.id && id !== "start") {
        setSceneHistory(prev => [...prev, { id: scene.id, background: backgroundImage }]);
      }

      const res = await axios.get(`http://localhost:3001/api/scene/${id}`);
      setScene(res.data.scene);
      setChoices(res.data.choices);

      const audioPath = `/audio/${id}.mp3`;

      const testAudio = new Audio(audioPath);
      testAudio.addEventListener("canplaythrough", async () => {
        if (currentAudio !== audioPath) {
          await playAudio(audioPath);
        }
      });
      testAudio.addEventListener("error", () => {
        console.log(`Audio za "${id}" ne postoji ili nije validan. Ostavljam prethodnu muziku.`);
      });
      testAudio.load();

      if (!backgroundImage && !isBackNavigation) {
        setBackgroundImage(`/images/bg_${id}.jpg`);
      }
    } catch (err) {
      console.error("Greška u loadScene:", err);
      setScene({ text: "Scena nije pronađena." });
      setChoices([]);
    }
  };

  const handleBack = () => {
    if (sceneHistory.length > 0) {
      const previousEntry = sceneHistory[sceneHistory.length - 1];
      setSceneHistory(prev => prev.slice(0, -1));
      setBackgroundImage(previousEntry.background);
      loadScene(previousEntry.id, true);
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => {
      const newValue = !prev;
      if (audioRef.current) {
        audioRef.current.volume = newValue ? 0 : 0.08;
      }
      return newValue;
    });
  };

  return (
    <>
      {!showIntro && (
        <div className={styles.topRightControls}>
          <button onClick={toggleMute} className={styles.iconButton}>
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          <button onClick={handleBack} className={styles.iconButton}>
            ⬅️
          </button>
        </div>
      )}

      {showIntro ? (
        <div className={styles.introContainer}>
          {!introStarted ? (
            <button
              className={`${styles.choiceButton} ${styles.playIntroButton}`}
              onClick={() => {
                playAudio('/audio/intro.mp3');
                setIntroStarted(true);
              }}
            >
              ▶️ Play intro
            </button>
          ) : (
            <>
              <h1 className={styles.introTitle}>A MAGICAL BIRTHDAY</h1>
              <div className={styles.introTextWrapper}>
                <div className={styles.introText}>

                  <p>
                    A long time ago...<br />
                    In a neighborhood not so far away...<br /><br />

                    🎂✨ A BIRTHDAY AWAKENS ✨🎂<br /><br />

                    It is a time of joy and wonder.<br />
                    The galaxy has aligned for a very special event...<br />
                    <strong>ALMA'S BIRTHDAY.</strong><br /><br />

                    Across the lands, preparations are being made.<br />
                    Gifts are wrapped with precision.<br />
                    Adventures wait silently in the shadows,<br />
                    ready to leap into action.<br /><br />

                    From the bustling lights of a <strong>Carnival Planet</strong>,<br />
                    to the heights of the <strong>Adventure Park Cliffs</strong>,<br />
                    and the quiet serenity of the <strong>Beach Moon of Relaxara</strong>,<br />
                    Alma’s day is about to unfold —<br />
                    not with blasters, but with surprises, laughter, and perhaps... cake.<br /><br />

                    Her path will be shaped by choices.<br />
                    Will she explore the sparkling game stalls?<br />
                    Swing across the jungle ropes like a true explorer?<br />
                    Or sip coffee under twin suns, pondering the mysteries of the day?<br /><br />

                    Every step, every game, every moment matters.<br />
                    For this is no ordinary birthday...<br /><br />

                    <strong>This is the Birthday of Destiny.</strong><br />
                    And Alma is the Chosen One.<br /><br />

                    Prepare yourself.<br />
                    The journey begins now.
                  </p>


                </div>
              </div>
              <button
                className={styles.choiceButton}
                onClick={() => setShowIntro(false)}
              >
                Begin the story
              </button>
            </>
          )}
        </div>
      ) : (
        <div
          className={styles.container}
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none"
          }}
        >
          <h2 className={styles.sceneText}>{scene?.text}</h2>
          <div className={styles.choicesContainer}>
            {choices.map((choice, index) => (
              <button
                key={choice.id}
                ref={(el) => (buttonRefs.current[index] = el)}
                className={styles.choiceButton}
                onClick={() => handleChoiceClick(choice)}
                style={{ width: buttonWidth ? `${buttonWidth}px` : 'auto' }}
              >
                {choice.text}
              </button>
            ))}
          </div>
        </div>
      )}

      <audio ref={audioRef} loop />
    </>
  );
}
