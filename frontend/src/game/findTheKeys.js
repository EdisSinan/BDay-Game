import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from './findTheKeys.module.css';

const generateRandomCoordinates = (imageWidth, imageHeight, numKeys) => {
    const coordinates = [];
    for (let i = 0; i < numKeys; i++) {
        const x = Math.random() * (imageWidth - 300);
        const y = Math.random() * (imageHeight);
        coordinates.push({ x, y });
    }
    return coordinates;
};

const levels = [
    {
        image: "/images/findkeys_park.jpg",
        keys: generateRandomCoordinates(1000, 700, 5),
    },
    {
        image: "/images/findkeys_beach.jpg",
        keys: generateRandomCoordinates(1000, 700, 3),
    },
];

export default function FindTheKeys() {
    const [levelIndex, setLevelIndex] = useState(0);
    const [found, setFound] = useState([]);
    const navigate = useNavigate();
    const currentLevel = levels[levelIndex];

    const audioRef = useRef(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.play();
            audioRef.current.volume = 0.08;
        }

        setFound([]);
    }, [levelIndex]);

    const handleKeyClick = (index) => {
        if (!found.includes(index)) {
            setFound(prev => [...prev, index]);
        }
    };

    const goToGameStands = () => {
        sessionStorage.setItem("skipIntroOnce", "true");
        sessionStorage.setItem("changeBackgroundImage", "true");
        sessionStorage.setItem("startMusicAgain", "true");
        navigate("/");
    };

    const handleNextLevel = () => {
        if (levelIndex < levels.length - 1) {
            setLevelIndex(prev => prev + 1);
        } else {
            goToGameStands();
        }
    };

    return (
        <div className={styles.fullscreen}>
            {/*Reminder add audio*/}
            <audio ref={audioRef} loop>
                <source src="/audio/findkeys.mp3" type="audio/mp3" />
                Your browser does not support the audio element.
            </audio>

            <div className={styles.status}>
                Level {levelIndex + 1} — Found {found.length}/{currentLevel.keys.length}
            </div>
            <div className={styles.imageWrapper}>
                <img
                    src={currentLevel.image}
                    alt="Find the keys"
                    className={styles.background}
                />
                {currentLevel.keys.map((key, idx) => (
                    <img
                        key={idx}
                        src="/images/key.png"
                        alt="key"
                        onClick={() => handleKeyClick(idx)}
                        className={styles.keyIcon}
                        style={{
                            left: `${key.x}px`,
                            top: `${key.y}px`,
                            opacity: found.includes(idx) ? 1 : 0.8,
                            pointerEvents: found.includes(idx) ? 'none' : 'auto',
                        }}
                    />
                ))}
            </div>

            <div className={styles.buttonContainer}>
                <button onClick={goToGameStands} className={styles.backButton}>🔙 Back to GameStands</button>

                <button
                    onClick={handleNextLevel}
                    className={styles.nextButton}
                    disabled={found.length !== currentLevel.keys.length}
                >
                    {levelIndex < levels.length - 1 ? "Next Level ➡️" : "🏁 Finish"}
                </button>
            </div>
        </div>
    );
}
