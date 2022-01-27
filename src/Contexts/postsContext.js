import { createContext } from "react";

const postsContext = createContext({basePosts: [], setBasePosts: (posts) => {}});
export default postsContext;
