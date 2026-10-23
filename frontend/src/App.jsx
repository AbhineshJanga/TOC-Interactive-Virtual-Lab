import { BrowserRouter, Routes, Route } from "react-router";
import Navbar from "./components/layout/Navbar";
import DfaLab from "./modules/automata/dfa/DfaLab";
import NfaLab from "./modules/automata/nfa/NfaLab";
import EpsilonNfaLab from "./modules/automata/epsilonNfa/EpsilonNfaLab";
import SubsetConstructionLab from "./modules/automata/subsetConstruction/SubsetConstructionLab";
import DfaMinimizationLab from "./modules/automata/dfaMinimization/DfaMinimizationLab";
import CfgLab from "./modules/cfg/CfgLab";
import PdaLab from "./modules/pda/PdaLab";
import TuringMachineLab from "./modules/turingMachine/TuringMachineLab";
import RegexLab from "./modules/regex/RegexLab";
import PumpingLemmaLab from "./modules/pumpingLemma/PumpingLemmaLab";
import ChomskyHierarchyLab from "./modules/chomskyHierarchy/ChomskyHierarchyLab";
import Home from "./pages/Home";
import Learn from "./pages/Learn";
import Experiment from "./pages/Experiment";
import NotFound from "./pages/NotFound";
function app() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/experiment" element={<Experiment />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/experiment/dfa" element={<DfaLab />} />
          <Route path="/experiment/nfa" element={<NfaLab />} />
          <Route path="/learn/dfa" element={<DfaLab />} />
          <Route path="/learn/nfa" element={<NfaLab />} />
          <Route path="/experiment/enfa" element={<EpsilonNfaLab />} />
          <Route path="/experiment/regex" element={<RegexLab />} />
          <Route path="/experiment/cfg" element={<CfgLab />} />
          <Route path="/experiment/pda" element={<PdaLab />} />
          <Route path="/experiment/turing-machine" element={<TuringMachineLab />} />
          <Route path="/learn/enfa" element={<EpsilonNfaLab />} />
          <Route path="/learn/nfa-to-dfa" element={<SubsetConstructionLab />} />
          <Route path="/learn/minimization" element={<DfaMinimizationLab />} />
          <Route path="/learn/cfg" element={<CfgLab />} />
          <Route path="/learn/derivations" element={<CfgLab />} />
          <Route path="/learn/parse-trees" element={<CfgLab />} />
          <Route path="/learn/pda" element={<PdaLab />} />
          <Route path="/learn/turing-machine" element={<TuringMachineLab />} />
          <Route path="/learn/regex" element={<RegexLab />} />
          <Route path="/learn/pumping-lemma" element={<PumpingLemmaLab />} />
          <Route path="/learn/chomsky-hierarchy" element={<ChomskyHierarchyLab />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
export default app;