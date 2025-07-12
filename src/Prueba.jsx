import React, { useEffect } from 'react';

const Prueba = () => {
  const saludo = 'Hola mundo';
  useEffect(() => {
    console.log(saludo);
  }, []);

  return <h1>{saludo}</h1>;
};

export default Prueba;
