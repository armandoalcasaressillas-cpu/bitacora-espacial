import { useEffect, useState } from "react"
import NoticiaCard from "./components/NoticiaCard/NoticiaCard.jsx"

const VITE_API_URL = import.meta.env.VITE_API_URL

function App() {
  const [noticias, setNoticias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [termino, setTermino] = useState("")

  useEffect(() => {
    const controlador = new AbortController()

    async function cargarNoticias() {
      setCargando(true)
      setError(null)

      try {
        const parametros = new URLSearchParams({ limit: 12, search: termino })
        const respuesta = await fetch(`${VITE_API_URL}/articles/?${parametros}`, {
          signal: controlador.signal,
        })

        if (!respuesta.ok) {
          throw new Error(`La API respondió ${respuesta.status}`)
        }

        const datos = await respuesta.json()
        setNoticias(datos.results)
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message)
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false)
        }
      }
    }

    cargarNoticias()

    return () => controlador.abort()
  }, [termino])

  function buscar(evento) {
    evento.preventDefault()
    setTermino(evento.target.elements.q.value.trim())
  }

  const sinResultados = !cargando && !error && noticias.length === 0

  return (
    <>
      <header className="contenedor cabecera">
        <p>Bitácora Espacial</p>
        <nav aria-label="Principal">
          <a href="#noticias">Noticias</a>
          <a href="#blogs">Blogs</a>
          <a href="#acerca">Acerca</a>
        </nav>
      </header>

      <main className="contenedor">
        <h1>Noticias de exploración espacial</h1>

        <form className="buscador" onSubmit={buscar}>
          <label htmlFor="busqueda">Buscar por tema</label>
          <input id="busqueda" name="q" type="search" placeholder="Ej.: Mars, Artemis, SpaceX" />
          <button type="submit">Buscar</button>
        </form>

        <section aria-labelledby="ultimas-noticias">
          <h2 id="ultimas-noticias">Últimas noticias</h2>

          {cargando && <p role="status">Cargando noticias…</p>}
          {error && <p role="alert">No se pudieron cargar las noticias: {error}</p>}
          {sinResultados && <p role="status">No hay noticias para "{termino}".</p>}

          <div className="grid-noticias">
            {noticias.map((noticia) => (
              <NoticiaCard
                key={noticia.id}
                titulo={noticia.title}
                resumen={noticia.summary}
                imagen={noticia.image_url}
                fuente={noticia.news_site}
                fecha={noticia.published_at}
                enlace={noticia.url}
              />
            ))}
          </div>
        </section>
      </main>

      <footer className="contenedor">
        <p>Datos: Spaceflight News API</p>
      </footer>
    </>
  )
}

export default App