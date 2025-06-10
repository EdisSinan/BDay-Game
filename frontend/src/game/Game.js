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
      if (redirected) {
        sessionStorage.removeItem("skipIntroOnce");
        loadScene("GameStands");
      } else {
        loadScene("start");
      }
    }
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
              <div className={styles.introTextWrapper}>
                <div className={styles.introText}>
                  {}
                  <p>EDISE NE ZABORAVI DODAT TEKST ZA IGRICU EDISE NE ZABORAVI DODAT TEKST ZA IGRICU EDISE FALI TI TEKST ZA INTRO EDISE 
                    TEKST EDISEEE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!</p>
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
