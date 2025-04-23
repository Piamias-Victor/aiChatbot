import { FC } from 'react';
import './globals.css';

const Home: FC = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-gray-100">
      <div className="card max-w-md w-full text-center">
        <h1 className="text-4xl font-bold ">Hello World</h1>
        <p className="mt-4 text-gray-600">
          Bienvenue dans l&apos;application d&apos;analyse pour pharmaciens
        </p>
        <button className="btn-primary mt-6">Commencer</button>
      </div>
    </main>
  );
};

export default Home;
