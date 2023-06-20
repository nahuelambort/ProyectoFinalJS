const apiUrl = 'https://pokeapi.co/api/v2/pokemon/';
const limit = 100;
const totalPokemon = 1010;
const cambioModo = document.getElementById("cambio_modo");
const body = document.body;
const inputNameID = document.getElementById("buscador");
const btnSearch = document.getElementById("search");
const randomButton = document.getElementById("poke_random");
const botonPokeTodos = document.getElementById("poke_todos");
const pokemonContent = document.getElementById("pokemonContent");
const pokeBoxContainer = document.getElementById("pokeBoxContent");
const listaAgregados = [];
const cajasOcupadas = [];

const capitalizeFirstLetter = string => string.charAt(0).toUpperCase() + string.slice(1);

const translateTypeToSpanish = typeName => {
  const typeTranslations = {
    normal: "Normal",
    fighting: "Lucha",
    flying: "Volador",
    poison: "Veneno",
    ground: "Tierra",
    rock: "Roca",
    bug: "Bicho",
    ghost: "Fantasma",
    steel: "Acero",
    fire: "Fuego",
    water: "Agua",
    grass: "Planta",
    electric: "Eléctrico",
    psychic: "Psíquico",
    ice: "Hielo",
    dragon: "Dragón",
    dark: "Siniestro",
    fairy: "Hada",
  };

  return typeTranslations[typeName] || typeName;
};

// CAMBIO DE MODO

const modoActual = localStorage.getItem("modo");
if (modoActual) {
  body.classList.add(modoActual);
}

cambioModo.addEventListener("click", () => {
  if (body.classList.contains("dark-mode")) {
    body.classList.remove("dark-mode");
    localStorage.setItem("modo", "light-mode");
  } else {
    body.classList.add("dark-mode");
    localStorage.setItem("modo", "dark-mode");
  }
});

// BOTONES

randomButton.addEventListener("click", obtenerPokemonAleatorio);
btnSearch.addEventListener("click", encontrarPokemon);

// GUARDAR LA LISTA EN JSON

function guardarPokemons() {
  localStorage.setItem("pokemons", JSON.stringify(listaAgregados));
}

// LOCAL STORAGE

window.addEventListener("load", function () {
  const storedPokemons = localStorage.getItem("pokemons");
  if (storedPokemons) {
    const parsedPokemons = JSON.parse(storedPokemons);
    listaAgregados.push(...parsedPokemons);
    mostrarPokemonAgregados();
  }
});

// FUNCION BUSCAR RANDOM

async function obtenerPokemonAleatorio() {
  try {
    Swal.fire({
      title: 'Buscando Pokémon Aleatorio...',
      html: 'Espere un momento...',
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const totalPokemons = 1010;
    const numeroAleatorio = Math.floor(Math.random() * totalPokemons);
    const pokemon = await obtenerPokemonInfo(numeroAleatorio.toString());

    Swal.close();
    mostrarPokemon(pokemon);
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error al obtener Pokémon aleatorio',
      text: 'Por favor, inténtelo nuevamente.',
    });
    console.error(error.message);
  }
}

// FUNCION BUSCAR POR NOMBRE Y NUMERO

function encontrarPokemon() {
  const pokemonNameOrNumber = inputNameID.value.trim().toLowerCase();

  Swal.fire({
    title: 'Buscando Pokémon...',
    html: 'Espere un momento...',
    timerProgressBar: true,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  obtenerPokemonInfo(pokemonNameOrNumber)
    .then((pokemon) => {
      Swal.close();
      mostrarPokemon(pokemon);
    })
    .catch(() => {
      Swal.fire({
        icon: 'error',
        title: 'No se encontró el Pokémon',
        text: 'Por favor, inténtelo nuevamente.',
      });
      const pokemonElement = document.createElement('div');
      pokemonElement.classList.add('pokemon');
      pokemonElement.innerHTML = `
        <p>NO EXISTE</p>
        <p>POKÉMON</p>
      `;

      pokemonContent.innerHTML = '';
      pokemonContent.appendChild(pokemonElement);
    });
}

// FUNCION PARA OBTENER LA INFORMACION DE UN POKEMON POR SU NOMBRE O NUMERO
async function obtenerPokemonInfo(nombrePokemon) {
  try {
    const response = await fetch(apiUrl + nombrePokemon);
    if (response.ok) {
      const pokemonData = await response.json();
      const pokemonInfo = {
        numero: pokemonData.id,
        nombre: capitalizeFirstLetter(pokemonData.name),
        tipos: pokemonData.types.map((type) => translateTypeToSpanish(type.type.name)),
      };
      return pokemonInfo;
    } else {
      throw new Error("No se encontró el Pokémon");
    }
  } catch (error) {
    throw new Error("Error al obtener la información del Pokémon");
  }
}

// FUNCION PARA MOSTRAR TODOS LOS POKEMON

botonPokeTodos.addEventListener("click", function () {
  const pokedexContainer = document.getElementById("pokemonContent");

  pokedexContainer.innerHTML = "";

  Swal.fire({
    title: 'Cargando todos los Pokémon...',
    html: 'Espere un momento...',
    timerProgressBar: true,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  obtenerTodosLosPokemon()
    .then((pokemonList) => {
      Swal.close();
      pokemonList.forEach((pokemon) => {
        mostrarPokemon(pokemon, pokedexContainer);
      });
    })
    .catch((error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error al obtener todos los Pokémon',
        text: 'Por favor, inténtelo nuevamente.',
      });
      console.error(error.message);
    });

  async function mostrarPokemon(pokemon, container) {
    const tipoPrincipal = pokemon.types ? pokemon.types[0] : "";
    const tipoSecundario = pokemon.types && pokemon.types.length > 1 ? pokemon.types[1] : "";

    const pokemonElement = document.createElement("div");
    pokemonElement.classList.add("pokemon", tipoPrincipal);
    pokemonElement.innerHTML = `
      <p><b>Número:</b> ${pokemon.numero}</p>
      <p><b>Nombre:</b> ${pokemon.nombre}</p>
      <p><b>Tipos:</b></p>
      <p>${tipoPrincipal}${tipoSecundario ? `, ${tipoSecundario}` : ""}</p>
      <img src="" alt="Imagen de Pokémon" id="pokemonImage" class="pokemon-image">
      <button id="${pokemon.numero}">Capturar</button>
    `;

    container.appendChild(pokemonElement);

    let agregador = activarBoton(pokemon.numero);
    agregador.addEventListener("click", function () {
      agregarLista(pokemon);
    });

    let pokemonImage = pokemonElement.querySelector(".pokemon-image");
    obtenerImagenPokemon(pokemon.numero)
      .then((imageUrl) => {
        pokemonImage.src = imageUrl;
      })
      .catch((error) => {
        console.error(error);
      });
  }
});

async function obtenerTodosLosPokemon() {
  try {
    let pokemonList = [];
    let offset = 0;

    while (pokemonList.length < totalPokemon) {
      const response = await fetch(`${apiUrl}?offset=${offset}&limit=${limit}`);

      if (response.ok) {
        const data = await response.json();
        const pokemonDetails = await obtenerDetallesPokemon(data.results);
        pokemonList = [...pokemonList, ...pokemonDetails];
        offset += limit;
      } else {
        throw new Error("No se pudo obtener la lista de Pokémon");
      }
    }

    pokemonList = pokemonList.slice(0, totalPokemon);
    return pokemonList;
  } catch (error) {
    throw new Error("Error al obtener la lista de Pokémon");
  }
};

async function obtenerDetallesPokemon(pokemonArray) {
  const promises = pokemonArray.map(async (pokemon) => {
    const response = await fetch(pokemon.url);
    if (response.ok) {
      const data = await response.json();
      const pokemonInfo = {
        numero: data.id,
        nombre: capitalizeFirstLetter(data.name),
        types: data.types.map((type) => translateTypeToSpanish(type.type.name)),
      };
      return pokemonInfo;
    } else {
      throw new Error(`No se pudo obtener la información del Pokémon ${pokemon.name}`);
    }
  });

  try {
    const pokemonList = await Promise.all(promises);
    return pokemonList;
  } catch (error) {
    throw new Error("Error al obtener los detalles de los Pokémon");
  }
};

// ACTIVADOR DE BOTON

function activarBoton(id) {
  const btnID = document.getElementById(id);
  return btnID;
};

// FUNCIÓN PARA AGREGARLOS A LA LISTA

function agregarLista(pokemon) {
  if (listaAgregados.length < 6) {
    listaAgregados.push(pokemon);
    mostrarPokemonAgregados();
    guardarPokemons();
  } else {
    Swal.fire({
      icon: 'error',
      title: '¡Lo siento!',
      text: '¡Ya alcanzaste el máximo de pokémon que puedes atrapar!',
    })
  }
};

// FUNCION PARA MOSTRAR LOS POKEMON DE LA LISTA

function mostrarPokemonAgregados() {
  pokeBoxContainer.innerHTML = "";

  if (listaAgregados.length <= 6) {
    for (let i = 0; i < listaAgregados.length; i++) {
      const pokemon = listaAgregados[i];
      let poke = "pokemonCaja" + pokemon.numero.toString();

      const pokeBoxElement = document.createElement("div");
      pokeBoxElement.id = poke;
      pokeBoxElement.classList.add(poke);

      const content = document.createElement("div");
      content.innerHTML = `
        <p><b>${pokemon.nombre}</b></p>
        <img src="" alt="Imagen de Pokémon" class="pokemon-image">
        <button id=${pokemon.nombre} class="boton-eliminar eliminar-${poke}">Liberar</button>`;

      pokeBoxElement.appendChild(content);
      pokeBoxContainer.appendChild(pokeBoxElement);
      cajasOcupadas.push(poke);


      let pokemonImage = content.querySelector(".pokemon-image");
      obtenerImagenPokemon(pokemon.numero)
        .then((imageUrl) => {
          pokemonImage.src = imageUrl;
        })
        .catch((error) => {
          console.error(error);
        });
    };
  };

  const EliminarPokemons = document.querySelectorAll(".boton-eliminar");
  EliminarPokemons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const nombrePokemon = btn.id;
      eliminarPokemon(nombrePokemon);
      const divPokemon = btn.parentNode.parentNode;
      divPokemon.remove();
    });
  });
  guardarPokemons();
}

// FUNCIÓN PARA BOTON ELIMINAR

function eliminarPokemon(nombrePokemon) {
  const index = listaAgregados.findIndex((pokemon) => pokemon.nombre === nombrePokemon);

  if (index !== -1) {
    listaAgregados.splice(index, 1);
  }
  guardarPokemons();
};

// FUNCION PARA MOSTRAR EL POKEMON BUSCADO

function mostrarPokemon(pokemon) {
  if (pokemon) {
    const tipos = pokemon.tipos.join(", ");

    const pokemonElement = document.createElement("div");
    pokemonElement.classList.add("pokemon", pokemon.tipos[0]);
    pokemonElement.innerHTML = `
      <p><b>Número:</b> ${pokemon.numero}</p>
      <p><b>Nombre:</b> ${pokemon.nombre}</p>
      <p><b>Tipos:</b></p>
      <p>${tipos}</p>
      <img src="" alt="Imagen de Pokémon" id="pokemonImage">
      <button id="${pokemon.numero}">Capturar</button>
    `;

    pokemonContent.innerHTML = "";
    pokemonContent.appendChild(pokemonElement);

    let pokemonImage = document.getElementById("pokemonImage");
    obtenerImagenPokemon(pokemon.numero)
      .then((imageUrl) => {
        pokemonImage.src = imageUrl;
      })
      .catch((error) => {
        console.error(error);
      });

    let agregador = activarBoton(pokemon.numero);
    agregador.addEventListener("click", function () {
      agregarLista(pokemon);
    });
  }
};

// IMAGEN DEL POKEMON

async function obtenerImagenPokemon(numero) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon-form/${numero}`);
    if (response.ok) {
      const data = await response.json();
      const imageUrl = data.sprites.front_default;
      return imageUrl;
    } else {
      throw new Error("No se pudo obtener la imagen del Pokémon");
    }
  } catch (error) {
    throw new Error("Error al obtener la imagen del Pokémon");
  }
};