const Discogs_token = 'CCzcYySgTZHGtPQAhqcxvgiOZoKzGaXoaWXPmvRj';
const input = document.getElementById('busquedaInput');
const boton = document.getElementById('buscarBtn');
const contenedor = document.getElementById('albumsContainer');
const homeBtn = document.getElementById('homeBtn');
const profileBtn = document.getElementById('profileBtn');
const URL_DGS = 'https://api.discogs.com/database/search'

boton.addEventListener('click', () => {
	const busqueda = input.value.trim();
	if (!busqueda) return alert('Escriba un artista o álbum.');
	buscaralbumes(busqueda);
});

async function buscaralbumes(busqueda) {
	contenedor.innerHTML	='<p class="text-gray-600 text-center w-full">Cargando...</p>';
	try {
		const url = `${URL_DGS}?q=${busqueda}&type=release&per_page=20&token=${Discogs_token}`;
		const resultado = await fetch(url);
		if (!resultado.ok) throw new Error("Error en la busqeda");
		const data = await resultado.json();
		renderAlbum(data.results);
	}	catch (err){
		contenedor.innerHTML = `<p class="text-red-400 text-center">${err.message}</p`;
	}
}


function renderAlbum(albums) {
	contenedor.innerHTML = "";
	if(!albums.length) {
		contenedor.innerHTML = '<p class="text-gray-600 text-center w-full">No se encontraron albumes</p>';
		return;
	}

	albums.forEach(album => {
		const card = document.createElement('div');
		card.className = "bg-white p-4 shadow text-center hover:shadow-lg transition";
		const portada = album.cover_image ;
		const titulo = album.title || 'Sin titulo';
		const id = album.id ;

		card.innerHTML = `
			<img src ="${portada}" alt="${titulo}" class="w-full h-60 object-cover  mb-3">
			<h3 class="font-bold text-gray-800 mb-2">${titulo}</h3>
			<div class="flex justify-center gap-1 mb-2" data-id="${id}">
				${crearCorazonHTML(id)}
			</div>
		`;
		contenedor.appendChild(card);
	});
}

function crearCorazonHTML(id) {
	const favorito = obtenerFavorito(id) === 1;
	const color = favorito ? 'text-red-400' : 'text-gray-200 hover:text-red-300';	
	return `<span class="corazon cursor-pointer text-3xl transition-colors ${color}">&#9829;</span>`;
}

function guardarFavorito(id, rating) {
	const ratings = JSON.parse(localStorage.getItem('ratings') || '{}');
	if (rating === 0) {
		delete ratings[id];
	} else {
		ratings[id] = rating;
	}
	localStorage.setItem('ratings', JSON.stringify(ratings));
}

function obtenerFavorito(id) {
	const ratings = JSON.parse(localStorage.getItem('ratings') || '{}');
	return ratings[id] || 0;
}

profileBtn.addEventListener('click', async () => {
	const ratings = JSON.parse(localStorage.getItem('ratings') || '{}');
	const ids	= Object.keys(ratings);
	if (ids.length === 0){
		contenedor.innerHTML = '<p class="text-gray-400 text-center col-span-full w-full mx-auto my-10">No has seleccionado ningún álbum como favorito.</p>';
		return;
	} 
	contenedor.innerHTML = '<p class="text-gray-400 text-center col-span-full w-full mx-auto my-10">Cargando tus álbumes favoritos. </p>';
	try {
		const ob_info = ids.map(id => 
			fetch(`${URL_DGS}?release_id=${id}&token=${Discogs_token}`).then(r => r.json())
		);
		const info = await Promise.all(ob_info);
		const albums = info.flatMap(d => d.results || []);
		renderAlbum(albums);
	} catch (err) {
		contenedor.innerHTML = `<p class="text-red-700 text-center col-span-full w-full mx-auto my-10">${err.message}</p>`;
	}
});

contenedor.addEventListener('click', (e) => {
	if (e.target.classList.contains('corazon')) {
			const contenedorCorazon = e.target.parentElement;
			const id = contenedorCorazon.dataset.id;
			const estadoActual = obtenerFavorito(id);
      const estadoNuevo = estadoActual === 1 ? 0 : 1; 
    	guardarFavorito(id, estadoNuevo);
      contenedorCorazon.innerHTML = crearCorazonHTML(id);
  }
});

homeBtn.addEventListener('click', cargarEstilosHome );

async function cargarEstilosHome() {
	contenedor.innerHTML = '<p class="text-gray-600 text-center col-span-full w-full mx-auto my-10>Cargando albums tops</p>';
	const estilos = ['Reggaeton', 'Pop', 'Electronic'];
	try {
		const peticiones = estilos.map(estilo => 
		fetch(`${URL_DGS}?genre=${estilo}&type=release&per_page=4&token=${Discogs_token}`).then(r => r.json())
		);
		const resultados = await Promise.all(peticiones);
		const todosLosAlbums = resultados.flatMap(data => data.results || []);
		input.value = '';
		renderAlbum(todosLosAlbums);
	} catch (err) {
		contenedor.innerHTML = `<p class="text-red-400 text-center col-span-full w-full mx-auto my-10">Error al cargar la página de inicio: ${err.message}</p>`;
	}
}
cargarEstilosHome();
