import { differenceInSeconds } from "date-fns";
import { useContext, useEffect } from "react";
import { CyclesContext } from "../..";
import { CountdownContainer, Separator } from "./styles";

export function Countdown() {
  const {
    activeCycle,
    activeCycleId,
    markCurrentCycleAsFinished,
    amountSecondsPassed,
    setSecondsPassed,
  } = useContext(CyclesContext);

  const totalSeconds = activeCycle ? activeCycle.minutesAmount * 60 : 0; //Verifica se o clico está ativo, e transforma os minutos inseridos em segundos

  /* 
    useEffect que calcula a diferença de segundos
  */

  useEffect(() => {
    let interval: number;

    if (activeCycle) {
      interval = setInterval(() => {
        //Calcula a diferença em segundos da data atual com a data de quando o ciclo foi iniciado

        const secondsDifference = differenceInSeconds(
          new Date(),
          activeCycle.startDate
        );

        if (secondsDifference >= totalSeconds) {
          markCurrentCycleAsFinished();

          setSecondsPassed(totalSeconds);
          clearInterval(interval);
        } else {
          setSecondsPassed(secondsDifference);
        }
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [
    activeCycle,
    totalSeconds,
    activeCycleId,
    markCurrentCycleAsFinished,
    setSecondsPassed,
  ]);

  const currentSeconds = activeCycle ? totalSeconds - amountSecondsPassed : 0; // Calcula quantos segundos restam

  const minutesAmount = Math.floor(currentSeconds / 60); //Calcula o número de minutos dentro dos segundos restantes e arredonda pra baixo

  const secondsAmount = currentSeconds % 60; //Calcula quantos segundos restam da divisão acima, pegando os segundo que não cabem em somente uma divisão

  const minutes = String(minutesAmount).padStart(2, "0"); //Define quantos caracteres essa string deve ter, e caso não tenha o número definido, adiciona 0 no começo
  const seconds = String(secondsAmount).padStart(2, "0");

  /* 
    useEffect que altera o titulo da página
  */

  useEffect(() => {
    if (activeCycle) {
      document.title = `${minutes}:${seconds}`;
    } else {
      document.title = "Ignite Timer";
    }
  }, [minutes, seconds, activeCycle]);

  return (
    <CountdownContainer>
      <span>{minutes[0]}</span>
      <span>{minutes[1]}</span>
      <Separator>:</Separator>
      <span>{seconds[0]}</span>
      <span>{seconds[1]}</span>
    </CountdownContainer>
  );
}
