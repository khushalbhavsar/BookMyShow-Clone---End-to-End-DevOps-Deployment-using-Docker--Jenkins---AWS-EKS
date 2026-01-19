import React from "react";
// Import styles
// import styles from "../../assets/styles/Card_seeAll.module.css";

const CardSeeAll = ({ data }) => {
  return (
    <div className="card-see-all">
      {/* Add your card see all content here */}
      <div>{data?.title}</div>
    </div>
  );
};

export default CardSeeAll;
