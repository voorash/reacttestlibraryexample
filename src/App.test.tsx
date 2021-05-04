import React from 'react';
import { unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import App from './App';

import { render, screen, fireEvent  } from '@testing-library/react'

// This is set to any to deal with the fact that we do have to null it out at times
let container: any = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

const spyFakeMovies = () => {
  jest.spyOn(global, "fetch").mockImplementation(() => 
      Promise.resolve({
        json: () => Promise.resolve(fakeMovieList)
      })
    );
}

const spyFakeMovieError = () => {
  jest.spyOn(global, "fetch").mockImplementation(() => 
      Promise.resolve({
        json: () => Promise.resolve(fakeMovieError)
      })
    );
}

const fakeMovieError = {
  "code" : "query.compiler.malformed",
  "error" : true,
  "message" : "Could not parse SoQL query \"select * limit bjb\" at line 1 character 16",
  "data" : {
    "query" : "select * limit bjb",
    "position" : { }
  }
}


const fakeMovieList = [
  {
    title: "a testmovietitle",
  },
  {
    title: "a1 testmovietitle",
  },
  {
    title: "b testmovietitle",
  }
];


describe("Movie List App", () => {
  it('renders without crashing', () => {
    render(<App />)
  });
  
  it('sorts ascending on load', async () => {
    spyFakeMovies();
    await act(async () => {
      render(<App />, container);
    });
    const movies = screen.getAllByText(/testmovietitle/);
    expect(movies.length).toBe(fakeMovieList.length);
    expect(movies[0].textContent).toBe('a testmovietitle');
    global.fetch.mockRestore();
  });
 

  it('sorts descending when Z-A clicked', async () => {
    spyFakeMovies();
    await act(async () => {
      render(<App />, container);
    });

    const descLink = screen.getByText(/Z-A/);
    act(() => {
      descLink.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const movies = screen.getAllByText(/testmovietitle/);
    expect(movies.length).toBe(fakeMovieList.length);
    expect(movies[0].textContent).toBe(fakeMovieList[fakeMovieList.length-1].title);

    global.fetch.mockRestore();
  });

  it('sorts ascending when A-Z clicked', async () => {
    spyFakeMovies();
    await act(async () => {
      render(<App />, container);
    });

    const descLink = screen.getByText(/Z-A/);
    const ascLink = screen.getByText(/A-Z/);

    // Sorts desc before resorting asc.  We can assume desc sorting works because it is tested in another test
    act(() => {
      descLink.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    act(() => {
      ascLink.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const movies = screen.getAllByText(/testmovietitle/);
    expect(movies.length).toBe(fakeMovieList.length);
    expect(movies[0].textContent).toBe(fakeMovieList[0].title);

    global.fetch.mockRestore();
  });

  it('filters on full match', async () => {
    spyFakeMovies();
    await act(async () => {
      render(<App />, container);
    });

    const titleFilter = screen.getByPlaceholderText(/Enter Title/);
    fireEvent.change(titleFilter, {
      target: { value: 'a testmovietitle' },
    });

    const movies = screen.getAllByText(/testmovietitle/);
    expect(movies.length).toBe(1);
    expect(movies[0].textContent).toBe('a testmovietitle');

    global.fetch.mockRestore();
  });

  it('filters on partial match', async () => {
    spyFakeMovies();
    await act(async () => {
      render(<App />, container);
    });

    const titleFilter = screen.getByPlaceholderText(/Enter Title/);
    fireEvent.change(titleFilter, {
      target: { value: 'a testmovie' },
    });

    const movies = screen.getAllByText(/testmovietitle/);
    expect(movies.length).toBe(1);
    expect(movies[0].textContent).toBe('a testmovietitle');

    global.fetch.mockRestore();
  });

  it('sorts descending while filtered', async () => {
    spyFakeMovies();
    await act(async () => {
      render(<App />, container);
    });

    const titleFilter = screen.getByPlaceholderText(/Enter Title/);
    fireEvent.change(titleFilter, {
      target: { value: 'a' },
    });

    const descLink = screen.getByText(/Z-A/);
    act(() => {
      descLink.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const movies = screen.getAllByText(/testmovietitle/);
    expect(movies.length).toBe(2);
    expect(movies[0].textContent).toBe('a1 testmovietitle');

    global.fetch.mockRestore();
  });

  it('renders without crashing if movies call fails', async () => {
    spyFakeMovieError();
    await act(async () => {
      render(<App />, container);
    });

    global.fetch.mockRestore();
  });
});


