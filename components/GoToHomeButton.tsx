import { useRouter } from "next/router";
import {
  useClearRefinements,
  useSearchBox,
} from "react-instantsearch-hooks-web";

const GoToHomeButton = () => {
  const api = useClearRefinements();
  const { refine } = useSearchBox();
  const router = useRouter();

  const goToHome = async () => {
    refine("");
    api.refine();
    await router.push("/");
  };

  return <button onClick={goToHome}>go to home</button>;
};

export { GoToHomeButton };
