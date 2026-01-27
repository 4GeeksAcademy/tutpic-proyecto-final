import { Outlet } from "react-router-dom/dist"
import ScrollToTop from "../components/ScrollToTop"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { DateTimeDisplay } from "../components/DateTimeDisplay"

export const Layout = () => {
    return (
        <ScrollToTop>
            <Navbar />
                <Outlet />
            <Footer />
            <DateTimeDisplay />
        </ScrollToTop>
    )
}