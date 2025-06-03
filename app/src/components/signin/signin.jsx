import React from "react";

class SignIn extends React.Component {
    constructor() {
        super();
          console.log('SignIn props:', this.props);
        this.state = {
            signInEmail: '',
            signInPassword: ''
        }
    }

    onEmailChange = (event) => {
        this.setState({ signInEmail: event.target.value });
    }

    onPasswordChange = (event) => {
        this.setState({ signInPassword: event.target.value });
    }

    onSubmitSignIn = () => {
        //console.log(this.state);
       // this.props.onRouteChange('home');

fetch('http://localhost:3000/signin', {
    method: 'post',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        email: this.state.signInEmail,
        password: this.state.signInPassword
    })
})
.then(response => response.json())
.then(data => {
    if (data.status === 'success') {
    console.log("RESPONSE FROM BACKEND:", data); // 👈 Add this
        this.props.loadUser(data.user);
        this.props.onRouteChange('home');
    } else {
        console.log('Sign in failed:', data);
    }
})
.catch(err => console.error('Error:', err));
    }

    render() {
        return (
            <article className="br2 ba shadow-5 b--black-10 mv4 w-100 w-50-m w-25-l mw5 center">
                <main className="pa4 black-80 center">
                    <form className="measure center">
                        <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
                            <legend className="f2 fw6 ph0 mh0">Sign In</legend>
                            <div className="mt3">
                                <label className="db fw6 lh-copy f6" htmlFor="email-address">Email</label>
                                <input
                                    className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                                    type="email"
                                    name="email-address"
                                    id="email-address"
                                    value={this.state.signInEmail}
                                    onChange={this.onEmailChange}
                                />
                            </div>
                            <div className="mv3">
                                <label className="db fw6 lh-copy f6" htmlFor="password">Password</label>
                                <input
                                    className="b pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                                    type="password"
                                    name="password"
                                    id="password"
                                    value={this.state.signInPassword}
                                    onChange={this.onPasswordChange}
                                />
                            </div>
                        </fieldset>
                        <div>
                            <input
                                onClick={this.onSubmitSignIn}
                                className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib"
                                type="button"
                                value="Sign in"
                            />
                        </div>
                        <div className="lh-copy mt3">
                            <a onClick={() => this.props.onRouteChange('register')} className="f6 link dim black db" href="#">Register</a>
                        </div>
                    </form>
                </main>
            </article>
        );
    }
}

export default SignIn;
