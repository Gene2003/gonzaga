import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Books = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    axios.get(' import.meta.env.VITE_API_BASE_URL/api/books/')
      .then(response => setBooks(response.data))
      .catch(error => console.error('Error fetching books:', error));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Books for Sale</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {books.map(book => (
          <div key={book.id} className="border rounded-xl p-4 shadow-md bg-white">
            {book.cover_image && (
              <img
                src={` import.meta.env.VITE_API_BASE_URL${book.cover_image}`}
                alt={book.title}
                className="w-full h-64 object-cover rounded"
              />
            )}
            <h2 className="text-lg font-semibold mt-2">{book.title}</h2>
            <p className="text-gray-600">{book.author}</p>
            <p className="text-green-700 font-bold mt-1">Ksh {book.price}</p>
            <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Books;
