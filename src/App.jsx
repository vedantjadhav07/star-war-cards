import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import { motion } from "framer-motion";

Modal.setAppElement("#root");

const API_KEY = "cbd0c3b1754b736fb821744d6e6d776b";
const BASE_URL = "https://api.themoviedb.org/3";
const MOVIE_ID = 299534; // Avengers: Endgame
const ITEMS_PER_PAGE = 6; // Characters per page

export default function App() {
  const [characters, setCharacters] = useState([]);
  const [filteredCharacters, setFilteredCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/movie/${MOVIE_ID}/credits`, {
          params: { api_key: API_KEY },
        });
        const validCharacters = response.data.cast.filter((char) => char.profile_path);
        setCharacters(validCharacters);
        setFilteredCharacters(validCharacters);
        setLoading(false);
      } catch (err) {
        setError("Failed to load characters. Try again later.");
        setLoading(false);
      }
    };
    fetchCharacters();
  }, []);

  useEffect(() => {
    const filtered = characters.filter((char) =>
      char.character.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCharacters(filtered);
    setCurrentPage(1);
  }, [searchQuery, characters]);

  const openModal = (character) => {
    setSelectedCharacter(character);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedCharacter(null);
  };

  const totalPages = Math.ceil(filteredCharacters.length / ITEMS_PER_PAGE);
  const paginatedCharacters = filteredCharacters.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-black text-gray-300 p-6">
      <h1 className="text-4xl font-extrabold text-center text-red-600 mb-6">
        Avengers: Endgame Characters
      </h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search characters..."
        className="w-full p-3 mb-6 text-gray-200 bg-gray-900 rounded-lg border border-red-600 focus:outline-none focus:ring-2 focus:ring-red-700"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {loading && <p className="text-center text-lg">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Character Grid */}
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        {paginatedCharacters.map((character) => (
          <motion.div
            key={character.id}
            className="bg-gray-900 p-4 rounded-xl shadow-lg cursor-pointer transition transform hover:scale-105 hover:bg-red-800 text-white"
            onClick={() => openModal(character)}
            whileHover={{ scale: 1.1 }}
          >
            <img
              src={`https://image.tmdb.org/t/p/w500${character.profile_path}`}
              alt={character.character}
              className="w-full h-48 object-cover rounded-lg"
            />
            <h2 className="text-xl font-bold mt-3 text-center">{character.character}</h2>
            <p className="text-sm text-gray-400 text-center">Played by {character.name}</p>
          </motion.div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 mx-2 bg-red-700 text-white rounded-lg hover:bg-red-800 disabled:bg-gray-500"
          >
            Previous
          </button>
          <span className="px-4 py-2">{currentPage} / {totalPages}</span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 mx-2 bg-red-700 text-white rounded-lg hover:bg-red-800 disabled:bg-gray-500"
          >
            Next
          </button>
        </div>
      )}

      {/* Character Details Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="bg-gray-900 p-6 max-w-lg mx-auto rounded-lg shadow-lg text-gray-300"
        overlayClassName="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center"
      >
        {selectedCharacter && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">{selectedCharacter.character}</h2>
            <p className="text-lg text-gray-400">Played by: {selectedCharacter.name}</p>
            <p className="mt-2 text-gray-500">Popularity: {selectedCharacter.popularity}</p>
            <p className="mt-2 text-gray-500">Department: {selectedCharacter.known_for_department}</p>

            <img
              src={`https://image.tmdb.org/t/p/w500${selectedCharacter.profile_path}`}
              alt={selectedCharacter.name}
              className="mt-4 rounded-lg w-40 mx-auto"
            />

            <button
              onClick={closeModal}
              className="mt-4 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800"
            >
              Close
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
