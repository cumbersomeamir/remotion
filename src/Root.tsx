import React from 'react';
import { Composition } from 'remotion';
import {RenderQuality} from './RenderQuality';
import {NeuralNetworkTraining} from './compositions/NeuralNetworkTraining';
import {BigBang} from './compositions/BigBang';
import {GalaxyFormation} from './compositions/GalaxyFormation';
import {AtomicBonding} from './compositions/AtomicBonding';
import {DNAReplication} from './compositions/DNAReplication';
import {Evolution} from './compositions/Evolution';
import {HumanCivilization} from './compositions/HumanCivilization';
import {FinancialMarkets} from './compositions/FinancialMarkets';
import {HumanAISymbiosis} from './compositions/HumanAISymbiosis';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="nn-training"
        component={NeuralNetworkTraining}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{quality: RenderQuality.FINAL}}
      />
      <Composition
        id="big-bang"
        component={BigBang}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{quality: RenderQuality.FINAL}}
      />
      <Composition
        id="galaxy-formation"
        component={GalaxyFormation}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{quality: RenderQuality.FINAL}}
      />
      <Composition
        id="atomic-bonding"
        component={AtomicBonding}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{quality: RenderQuality.FINAL}}
      />
      <Composition
        id="dna-replication"
        component={DNAReplication}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{quality: RenderQuality.FINAL}}
      />
      <Composition
        id="evolution"
        component={Evolution}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{quality: RenderQuality.FINAL}}
      />
      <Composition
        id="human-civilization"
        component={HumanCivilization}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{quality: RenderQuality.FINAL}}
      />
      <Composition
        id="financial-markets"
        component={FinancialMarkets}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{quality: RenderQuality.FINAL}}
      />
      <Composition
        id="human-ai-symbiosis"
        component={HumanAISymbiosis}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{quality: RenderQuality.FINAL}}
      />
    </>
  );
};

