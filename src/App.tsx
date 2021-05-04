import React from 'react';
import movieDataService from './services/movieDataService';
import Types from './types';

const App: React.FC = () => {
  const [movieList, setMovieList] = React.useState<Types.MovieInterface[]>([]);
  const [sortedMovieList, setSortedMovieList] = React.useState<Types.MovieInterface[]>([]);
  const [searchString, setSearchString] = React.useState('');
  const [sortAlgo, setSortAlgo] = React.useState<any>('titleAsc');
   
  React.useEffect(() => {
    movieDataService.get().then(dataOrError => {
      const isData = Array.isArray(dataOrError);
      if (isData) {
        setMovieList(dataOrError);
      }
    });
  }, []);

  React.useEffect(() => {
    // Don't bother sorting if no items or one item
    if(movieList.length<2) {
      return;
    }
    const movieSort = (a: Types.MovieInterface, b: Types.MovieInterface) => {
      if(sortAlgo === 'titleAsc') {
        // This might be a bit more than required but should help correctly sort accented characters
        return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
      } else {
        return b.title.toLowerCase().localeCompare(a.title.toLowerCase())
      }
    };
    // The spread operator here makes sure we do not mutate the original
    setSortedMovieList([...movieList].sort(movieSort))
    
  }, [movieList, sortAlgo]);

  const titleFilter = (movie: Types.MovieInterface) => {
    if(searchString==='' || movie.title.toLowerCase().includes(searchString.toLowerCase())) {
      return true;
    }
  }
  
  return (
    <div className="page">
      <div className="page__filters filters">
        <h2>Filters</h2>
        Title:
        <br />
        <input
          placeholder="Enter Title"
          name="searchString"
          value={searchString}
          onChange={(e) => {setSearchString(e.target.value)}}
          className="search-input"
        />
        <h2>Sort</h2>
        Title: (
          <span id="title_sort_asc" onClick={() => {setSortAlgo('titleAsc')}}>A-Z</span> | 
          <span id="title_sort_desc" onClick={() => {setSortAlgo('titleDesc')}}>Z-A</span>)
      </div>

      {/*Add message for no reults and all results filtered*/}

      <div className="page__results results">
        {sortedMovieList.filter(titleFilter).map(movie => (
          <section className="movie" key={movie.title}>
            <h1 className="movie__title">
              {movie.title}
              <span className="movie__release-year">{movie.release_year}</span>
            </h1>

            {!!movie.actors && (
              <span className="movie__section movie__actors">
                <span className="movie__section-title movie__actors-title">
                  Actors:
                </span>

                <ol className="movie__section-list movie__actors-list">
                  {movie.actors.map(actor => (
                    <li
                      className="movie__section-list-item movie__actors-list-item"
                      key={actor}
                    >
                      {actor}
                    </li>
                  ))}
                </ol>
              </span>
            )}

            {!!movie.locations.length && (
              <span className="movie__section movie__locations">
                <span className="movie__section-title movie__locations-title">
                  Locations:
                </span>

                <ul className="movie__section-list movie__locations-list">
                  {movie.locations.map(location => (
                    <li
                      className="movie__section-list-item movie__locations-list-item"
                      key={location}
                    >
                      {location}
                    </li>
                  ))}
                </ul>
              </span>
            )}

            {!!movie.fun_facts && (
              <p className="movie__fun-facts">{movie.fun_facts}</p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
};

export default App;
