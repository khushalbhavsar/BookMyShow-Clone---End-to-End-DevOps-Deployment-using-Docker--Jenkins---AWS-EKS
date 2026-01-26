import "./App.css";
import Footer from "../components/common/Footer";
import Navbar from "../components/common/Navbar";
import Router from "../routes/Router";

function App() {
  return (
    <div className="App">
      <Navbar />
      <Router />
      <Footer />

    </div>
  );
}

export default App;
