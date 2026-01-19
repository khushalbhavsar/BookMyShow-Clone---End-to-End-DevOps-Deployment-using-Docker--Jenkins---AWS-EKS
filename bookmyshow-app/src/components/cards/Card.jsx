import React from "react";
// Import styles
// import styles from "../../assets/styles/Card.module.css";

const Card = ({ data }) => {
  return (
    <div className="card">
      {/* Add your card content here */}
      <div>{data?.title}</div>
    </div>
  );
};

export default Card;
