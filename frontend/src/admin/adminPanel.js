import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from './AdminPanel.module.css';

export default function AdminPanel() {
  const [sceneId, setSceneId] = useState("");
  const [sceneText, setSceneText] = useState("");
  const [choices, setChoices] = useState([{ text: "", next_scene: "", action: "" }]);
  const [scenes, setScenes] = useState([]);
  const [selectedScene, setSelectedScene] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:3001/api/scenes")
      .then(response => setScenes(response.data))
      .catch(err => console.error("Error loading scenes", err));
  }, []);

  const handleAddChoice = () => {
    setChoices([...choices, { text: "", next_scene: "", action: "" }]);
  };

  const handleRemoveChoice = () => {
    if (choices.length > 1) {
      setChoices(choices.slice(0, -1));
    }
  };

  const handleChoiceChange = (index, field, value) => {
    const newChoices = [...choices];
    newChoices[index][field] = value;
    setChoices(newChoices);
  };

  const handleSceneChange = (sceneId) => {
    axios.get(`http://localhost:3001/api/scene/${sceneId}`)
      .then(response => {
        setSceneId(response.data.scene.id);
        setSceneText(response.data.scene.text);
        setChoices(response.data.choices);
        setSelectedScene(sceneId);
      })
      .catch(err => console.error("Error loading scene", err));
  };

  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:3001/api/scene", {
        id: sceneId,
        text: sceneText,
        choices,
      });
      alert("Scena unesena!");
      setSceneId("");
      setSceneText("");
      setChoices([{ text: "", next_scene: "", action: "" }]);
    } catch (err) {
      console.error(err);
      alert("Greška pri unosu.");
    }
  };

  const handleUpdateScene = async () => {
    try {
      await axios.put(`http://localhost:3001/api/scene/${sceneId}`, {
        text: sceneText,
        choices: choices
      });
      alert("Scena uspešno ažurirana!");
    } catch (err) {
      console.error(err);
      alert("Greška pri ažuriranju scene.");
    }
  };

  const handleUpdateChoice = async (choiceId, newText) => {
    try {
      await axios.put(`http://localhost:3001/api/choice/${choiceId}`, { text: newText });
      alert("Izbor uspešno ažuriran!");
    } catch (err) {
      console.error(err);
      alert("Greška pri ažuriranju izbora.");
    }
  };

  return (
    <div className={styles.container}>
      <h2>Dodaj novu scenu</h2>
      <input
        placeholder="ID scene"
        value={sceneId}
        onChange={(e) => setSceneId(e.target.value)}
      />
      <br />
      <textarea
        placeholder="Tekst scene"
        value={sceneText}
        onChange={(e) => setSceneText(e.target.value)}
      />
      <section>
        <h4>Izbori:</h4>
        {choices.map((choice, index) => (
          <div key={index} className={styles.choiceContainer}>
            <input
              placeholder="Tekst izbora"
              value={choice.text}
              onChange={(e) => handleChoiceChange(index, "text", e.target.value)}
            />
            <input
              placeholder="ID sledeće scene"
              value={choice.next_scene}
              onChange={(e) => handleChoiceChange(index, "next_scene", e.target.value)}
            />
            <input
              placeholder="Akcija (opcionalno)"
              value={choice.action}
              onChange={(e) => handleChoiceChange(index, "action", e.target.value)}
            />
          </div>
        ))}
        <div className={styles.choiceButtons}>
          <button className={styles.choiceButton} onClick={handleAddChoice}>+ Dodaj izbor</button>
          <button className={styles.choiceButton} onClick={handleRemoveChoice}>- Ukloni zadnji izbor</button>
        </div>
      </section>
      <div className={styles.choiceButtons}>
      <button onClick={handleSubmit}>Spremi scenu</button>
      <button onClick={handleUpdateScene}>Ažuriraj scenu</button>
      </div>
      <section>
        <h3>Postojeće scene</h3>
        <div className={styles.sceneList}>
          {scenes.map(scene => (
            <div key={scene.id} className={styles.sceneItem}>
              <button onClick={() => handleSceneChange(scene.id)}>Izmeni {scene.id}</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
