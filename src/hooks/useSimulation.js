import { useReducer, useCallback } from 'react';

const STAGE_ORDER = ['DISCOVERY', 'ASSESSMENT', 'INTERVENTION', 'OUTCOME'];

function createInitialState(scenario) {
  return {
    stage: 'DISCOVERY',
    vitals: { ...scenario.initialVitals },
    messages: [
      {
        id: Date.now(),
        type: 'system',
        content: scenario.stages.DISCOVERY.systemMessage,
        timestamp: 0,
      },
      {
        id: Date.now() + 1,
        type: 'scenario',
        content: scenario.stages.DISCOVERY.description,
        timestamp: 0,
      },
    ],
    actionLog: [],
    performedActions: [],
    isCompleted: false,
    startTime: Date.now(),
    elapsedMs: 0,
  };
}

function simulationReducer(state, action) {
  switch (action.type) {
    case 'PERFORM_ACTION': {
      const { actionData, aiMessage, elapsed } = action.payload;

      const logEntry = {
        id: actionData.id,
        label: actionData.label,
        stage: state.stage,
        isCorrect: actionData.isCorrect,
        score: actionData.score,
        timestamp: elapsed,
      };

      const newVitals = actionData.vitalChange
        ? { ...state.vitals, ...actionData.vitalChange }
        : { ...state.vitals };

      const feedbackMsg = {
        id: Date.now(),
        type: actionData.isCorrect ? 'feedback-good' : 'feedback-warn',
        content: actionData.feedback,
        timestamp: elapsed,
      };

      const patientMsg = aiMessage
        ? {
            id: Date.now() + 1,
            type: 'patient',
            content: aiMessage,
            timestamp: elapsed,
          }
        : null;

      const newMessages = patientMsg
        ? [...state.messages, feedbackMsg, patientMsg]
        : [...state.messages, feedbackMsg];

      return {
        ...state,
        vitals: newVitals,
        actionLog: [...state.actionLog, logEntry],
        performedActions: [...state.performedActions, actionData.id],
        messages: newMessages,
        elapsedMs: elapsed,
      };
    }

    case 'NEXT_STAGE': {
      const currentIndex = STAGE_ORDER.indexOf(state.stage);
      const nextStage = STAGE_ORDER[currentIndex + 1];

      if (!nextStage) {
        return { ...state, isCompleted: true };
      }

      return {
        ...state,
        stage: nextStage,
        performedActions: [],
        messages: [
          ...state.messages,
          {
            id: Date.now(),
            type: 'system',
            content: action.payload.systemMessage,
            timestamp: state.elapsedMs,
          },
          {
            id: Date.now() + 1,
            type: 'scenario',
            content: action.payload.description,
            timestamp: state.elapsedMs,
          },
        ],
      };
    }

    case 'COMPLETE':
      return { ...state, isCompleted: true };

    case 'UPDATE_ELAPSED':
      return { ...state, elapsedMs: action.payload };

    case 'RESET':
      return createInitialState(action.payload);

    default:
      return state;
  }
}

export function useSimulation(scenario) {
  const [state, dispatch] = useReducer(
    simulationReducer,
    scenario,
    createInitialState
  );

  const getElapsed = useCallback(
    () => Date.now() - state.startTime,
    [state.startTime]
  );

  const performAction = useCallback(
    (actionData, aiMessage) => {
      dispatch({
        type: 'PERFORM_ACTION',
        payload: { actionData, aiMessage, elapsed: getElapsed() },
      });
    },
    [getElapsed]
  );

  const goNextStage = useCallback(
    (scenario) => {
      const currentIndex = STAGE_ORDER.indexOf(state.stage);
      const nextStage = STAGE_ORDER[currentIndex + 1];
      if (!nextStage) {
        dispatch({ type: 'COMPLETE' });
        return;
      }
      dispatch({
        type: 'NEXT_STAGE',
        payload: {
          systemMessage: scenario.stages[nextStage].systemMessage,
          description: scenario.stages[nextStage].description,
        },
      });
    },
    [state.stage]
  );

  const complete = useCallback(() => {
    dispatch({ type: 'COMPLETE' });
  }, []);

  const reset = useCallback(
    (scenario) => {
      dispatch({ type: 'RESET', payload: scenario });
    },
    []
  );

  const isLastStage = STAGE_ORDER.indexOf(state.stage) === STAGE_ORDER.length - 1;
  const stageIndex = STAGE_ORDER.indexOf(state.stage);
  const currentActions = scenario.stages[state.stage]?.actions ?? [];
  const criticalActionsInStage = currentActions.filter(
    (a) => a.isCritical && a.isCorrect
  );
  const completedCriticalInStage = criticalActionsInStage.filter((a) =>
    state.performedActions.includes(a.id)
  );
  const canAdvance = completedCriticalInStage.length >= Math.ceil(criticalActionsInStage.length / 2);

  return {
    state,
    stageIndex,
    isLastStage,
    canAdvance,
    currentActions,
    performAction,
    goNextStage,
    complete,
    reset,
    getElapsed,
  };
}
