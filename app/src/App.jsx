import React, { Component } from 'react';
import 'whatwg-fetch'; // Add fetch polyfill
import Navigation from './components/navigation/navigation.jsx';
import Logo from './components/logo/logo.jsx';
import ImageLinkForm from './components/imageLinkForm/imageLinkForm.jsx';
import Rank from './components/rank/rank.jsx';
import SignIn from './components/signin/signin.jsx';
import Register from './components/register/register.jsx';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      faceData: [],
      error: null,
      box: {},
      route: 'signin', // Start at signin
      isSignedIn:false,
      user:{
            id: '',
            name: '',
            password: '',
            email: '',
            entries: 0,
            joined: ''
      }
    };
  }

  loadUser = (data) =>{
    this.setState(
      {
         user:{
         id:data.id,
         name: data.name,
         email: data.email,
         entries: data.entries,
         joined: data.joined
      }}
     
    )
  }

  calculateFaceLocation = (data) => {
    const regions = data.outputs?.[0]?.data?.regions;
    if (!regions || regions.length === 0) return {};

    const clarifaiFace = regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);

    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      width: (clarifaiFace.right_col - clarifaiFace.left_col) * width,
      height: (clarifaiFace.bottom_row - clarifaiFace.top_row) * height,
    };
  };

  onInputChange = (event) => {
    this.setState({ input: event.target.value, error: null });
  };

  displayFaceBox = (box) => {
    this.setState({ box: box });
  };

onButtonSubmit = () => {
    if (!this.state.user.id) {
        this.setState({ error: 'User not signed in' });
        return;
    }

    this.setState({ imageUrl: this.state.input, faceData: [], error: null });

    fetch('http://localhost:3000/api/clarifai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            imageUrl: this.state.input,
            id: this.state.user.id // Include user ID
        }),
    })
    .then((response) => {
        if (!response.ok) {
            return response.json().then((errData) => {
                throw new Error(errData.error || 'API request failed');
            });
        }
        return response.json();
    })
    .then((data) => {
        const regions = data.clarifaiResult.outputs?.[0]?.data?.regions;

        if (regions && regions.length > 0) {
            this.displayFaceBox(this.calculateFaceLocation(data.clarifaiResult));

            const faceData = regions.map((region) => {
                const boundingBox = region.region_info.bounding_box;
                const topRow = boundingBox.top_row.toFixed(3);
                const leftCol = boundingBox.left_col.toFixed(3);
                const bottomRow = boundingBox.bottom_row.toFixed(3);
                const rightCol = boundingBox.right_col.toFixed(3);
                const concepts = region.data.concepts
                    ? region.data.concepts.map((concept) => ({
                          name: concept.name,
                          value: concept.value.toFixed(4),
                      }))
                    : [];
                return {
                    boundingBox: { topRow, leftCol, bottomRow, rightCol },
                    concepts,
                };
            });

            this.setState((prevState) => ({
                faceData,
                user: {
                    ...prevState.user,
                    entries: data.entries // Update entries from response
                }
            }));
        } else {
            this.setState({ error: 'No faces detected in the image', user: { ...this.state.user, entries: data.entries } });
        }
    })
    .catch((error) => {
        this.setState({ error: error.message });
        console.error('Error:', error);
    });
};

onRouteChange = (route) => {
  if (route === 'signout') {
    this.setState({ isSignedIn: false, route: 'signin' });
  } else if (route === 'home') {
    this.setState({ isSignedIn: true, route });
  } else {
    this.setState({ route });
  }
};

  render() {
    const { input, imageUrl, faceData, error, box, route } = this.state;

    return (
      <div className="App">
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={this.state.isSignedIn}/>

        {route === 'home' && (
          <>
            <Logo />
            <Rank name={this.state.user.name} entries={this.state.user.entries}/>
            <ImageLinkForm
              input={input}
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit}
            />
            {error && <p className="error">{error}</p>}
            {imageUrl && (
              <div className="image-container">
                <img
                  id="inputImage"
                  src={imageUrl}
                  alt="Uploaded"
                  className="uploaded-image"
                  width="500px"
                  height="auto"
                />
                <div
                  className="bounding-box"
                  style={{
                    top: box.topRow,
                    left: box.leftCol,
                    width: box.width,
                    height: box.height,
                  }}
                ></div>
              </div>
            )}
            {faceData.length > 0 && (
              <div className="face-data">
                <h2>Detected Faces</h2>
                {faceData.map((face, index) => (
                  <div key={index} className="face-item">
                    <h3>Face {index + 1}</h3>
                    <p>
                      Bounding Box: Top: {face.boundingBox.topRow}, Left: {face.boundingBox.leftCol},
                      Bottom: {face.boundingBox.bottomRow}, Right: {face.boundingBox.rightCol}
                    </p>
                    {face.concepts.map((concept, i) => (
                      <p key={i}>
                        {concept.name}: {concept.value}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {route === 'signin' && (
          <>
            <Logo />
          <SignIn
            onRouteChange={this.onRouteChange}
            loadUser={this.loadUser}
          />         
           </>
        )}

        {route === 'register' && (
          <>
            <Logo />
            <Register loadUser ={this.loadUser} onRouteChange={this.onRouteChange} />
          </>
        )}

      </div>
    );
  }
}

export default App;
