import { useState, useCallback, useEffect } from 'react';
import scenario from './data/scenarios.json';
import { useSimulation } from './hooks/useSimulation';
import { getPatientResponse, initGeminiChat } from './utils/geminiClient';
import { analyzeActionLog } from './utils/debriefingAnalyzer';
import Header from './components/Header';
import PatientMonitor from './components/PatientMonitor';
import ChatInterface from './components/ChatInterface';
import ActionPanel from './components/ActionPanel';
import PatientImagePanel from './components/PatientImagePanel';
import MediaPlayer from './components/MediaPlayer';
import DebriefingModal from './components/DebriefingModal';

export default function App() {
  const sim = useSimulation(scenario);
  const [isLoading, setIsLoading] = useState(false);
  const [showDebriefing, setShowDebriefing] = useState(false);
  const [debriefingData, setDebriefingData] = useState(null);

  useEffect(() => {
    initGeminiChat(scenario);
  }, []);

  const handleAction = useCallback(
    async (actionData) => {
      if (isLoading) return;
      setIsLoading(true);
      try {
        const aiMessage = await getPatientResponse(
          actionData,
          sim.state.vitals,
          sim.state.stage
        );
        sim.performAction(actionData, aiMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, sim]
  );

  const handleNextStage = useCallback(() => {
    if (sim.isLastStage) {
      const data = analyzeActionLog(sim.state.actionLog, scenario);
      setDebriefingData(data);
      setShowDebriefing(true);
      sim.complete();
    } else {
      sim.goNextStage(scenario);
    }
  }, [sim]);

  const handleReset = useCallback(() => {
    setShowDebriefing(false);
    setDebriefingData(null);
    sim.reset(scenario);
    initGeminiChat(scenario);
  }, [sim]);

  const handleShowDebriefing = useCallback(() => {
    if (!debriefingData) {
      const data = analyzeActionLog(sim.state.actionLog, scenario);
      setDebriefingData(data);
    }
    setShowDebriefing(true);
  }, [debriefingData, sim.state.actionLog]);

  const { state, stageIndex, isLastStage, canAdvance, currentActions } = sim;
  const currentStageData = scenario.stages[state.stage];

  return (
    <div className="flex flex-col h-screen bg-med-bg overflow-hidden">
      <Header
        stage={state.stage}
        isCompleted={state.isCompleted}
        startTime={state.startTime}
        onReset={handleReset}
        onShowDebriefing={handleShowDebriefing}
        hasResults={state.isCompleted || state.actionLog.length > 0}
      />

      {/* 메인 레이아웃 */}
      <div className="flex-1 min-h-0 p-3 grid gap-3" style={{
        gridTemplateColumns: '240px 1fr 220px',
        gridTemplateRows: '1fr auto',
      }}>
        {/* 왼쪽: 환자 이미지 + 미디어 플레이어 */}
        <div className="flex flex-col gap-3 min-h-0 overflow-hidden">
          <PatientImagePanel stage={state.stage} vitals={state.vitals} />
          <MediaPlayer stage={state.stage} />
        </div>

        {/* 가운데: 채팅 피드 */}
        <div className="flex flex-col gap-3 min-h-0 overflow-hidden">
          <ChatInterface messages={state.messages} isLoading={isLoading} />

          {/* 행동 선택 패널 */}
          <div className="shrink-0">
            <ActionPanel
              stage={state.stage}
              stageData={currentStageData}
              performedActions={state.performedActions}
              onAction={handleAction}
              onNextStage={handleNextStage}
              canAdvance={canAdvance}
              isLastStage={isLastStage}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* 오른쪽: 환자 모니터 */}
        <div className="min-h-0 overflow-y-auto scrollbar-thin">
          <PatientMonitor vitals={state.vitals} />
        </div>
      </div>

      <DebriefingModal
        isOpen={showDebriefing}
        onClose={() => setShowDebriefing(false)}
        data={debriefingData}
        patientName={`${scenario.patient.name} (${scenario.patient.age}세)`}
      />
    </div>
  );
}
