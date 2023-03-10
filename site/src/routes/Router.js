import { lazy } from "react";
import { Navigate } from "react-router-dom";

/****Layouts*****/
const FullLayout = lazy(() => import("../layouts/FullLayout.js"));

/***** Pages ****/

const Starter = lazy(() => import("../views/Starter.js"));
const CamapignContentComponent = lazy(() => import("../views/CamapignContentComponent.js"));
const Project = lazy(() => import("../views/Project.js"));
const CampaignComponent = lazy(() => import("../views/CampaignComponent.js"));
const DataFromReelApi = lazy(() => import("../views/DataFromReelApi.js"));
const DataFromReelTraverse = lazy(() => import("../views/DataFromReelTraverse.js"));
const RetryReelTraverse = lazy(() => import("../views/RetryReelTraverse.js"));
const Login = lazy(() => import("../views/Login.js"));
const Logout = lazy(() => import("../views/Logout.js"));
const Protected = lazy(() => import("../views/Protected.js"));
const UsersInfo = lazy(() => import("../views/UsersInfo.js"));
const UpdatePassword = lazy(() => import("../views/UpdatePassword.js"));
const PageEngagementRate = lazy(() => import("../views/PageEngagementRate.js"));
const Testing = lazy(() => import("../views/testing.js"));
const About = lazy(() => import("../views/About.js"));
const Alerts = lazy(() => import("../views/ui/Alerts"));
const Badges = lazy(() => import("../views/ui/Badges"));
const Buttons = lazy(() => import("../views/ui/Buttons"));
const Cards = lazy(() => import("../views/ui/Cards"));
const Grid = lazy(() => import("../views/ui/Grid"));
const Tables = lazy(() => import("../views/ui/Tables"));
const Forms = lazy(() => import("../views/ui/Forms"));
const Breadcrumbs = lazy(() => import("../views/ui/Breadcrumbs"));

/*****Routes******/

const ThemeRoutes = [
  {
    path: "/",
    // element: <FullLayout />,
    element: <Protected Component={FullLayout} />, 
    children: [
      { path: "/", element: <Navigate to="/project" /> },
      { path: "/starter", exact: true, element: <Protected Component={Starter} />},
      { path: "/project", exact: true, element: <Protected Component={Project} />},
      { path: "/Instagram-Campaign", exact: true, element: <Protected Component={CampaignComponent} />},
      { path: "/Youtube-Campaign", exact: true, element: <Protected Component={CampaignComponent} />},
      { path: "/Instagram-Content", exact: true, element: <Protected Component={CamapignContentComponent} />},
      { path: "/Youtube-Content", exact: true, element: <Protected Component={CamapignContentComponent} />},
      { path: "/users", exact: true, element: <Protected Component={UsersInfo} />},
      { path: "/Update-Password", exact: true, element: <Protected Component={UpdatePassword} />},
      { path: "/Engagement-Rate", exact: true, element: <Protected Component={PageEngagementRate} />},
      { path: "/about", exact: true, element: <About /> },
      { path: "/alerts", exact: true, element: <Alerts /> },
      { path: "/badges", exact: true, element: <Badges /> },
      { path: "/buttons", exact: true, element: <Buttons /> },
      { path: "/cards", exact: true, element: <Cards /> },
      { path: "/grid", exact: true, element: <Grid /> },
      { path: "/table", exact: true, element: <Tables /> },
      { path: "/forms", exact: true, element: <Forms /> },
      { path: "/breadcrumbs", exact: true, element: <Breadcrumbs /> },
    ],
  },
  {
    path: "/login",
    exact: true,
    element: <Login />,
  },
  {
    path: "/logout",
    exact: true,
    element: <Logout />,
  },
  {
    path: "/cronReelApi",
    exact: true,
    element: <DataFromReelApi />,
  },
  {
    path: "/cronReelTraverse",
    exact: true,
    element: <DataFromReelTraverse />,
  },
  {
    path: "/cronReelRetry",
    exact: true,
    element: <RetryReelTraverse />,
  },
  {
    path: "/testing",
    exact: true,
    element: <Testing />,
  },
  {
    path: "*",
    element: <Navigate to="/project" />,
  }
];

export default ThemeRoutes;
