import { Link } from "react-router-dom";
import logoTwoImageUrl from "../assets/img/022-17.jpg";

export const Navbar = () => {

	return (
		<nav className="navbar navbar-light bg-light">

			<div className="container">
				<Link to="/">
					<button className="btn btn-warning" onClick={() => navigate("/")}><p className="lead">
						<img
							src={logoTwoImageUrl}
							alt="Logo"
							style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "50%" }}
						/>
					</p>Ir a HOME</button>
				</Link>

				<div className="ml-auto d-flex gap-2">
					<Link to="/blog">
						<button className="btn btn-primary">Blog</button>
					</Link>
					<Link to="/demo">
						<button className="btn btn-warning">Check the Context in action</button>
					</Link>
				</div>
			</div>
		</nav>
	);
};