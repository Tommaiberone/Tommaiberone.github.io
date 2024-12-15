import React from 'react';
import ReactDOM from 'react-dom';

function App() {
  const handleClick = () => {
    alert("Pulsante cliccato! Esegui la tua azione qui.");
  };

  return (
    <div className="container">
      <button onClick={handleClick}>Cliccami</button>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
