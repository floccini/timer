import { HandPalm, Play } from "phosphor-react";
import {
  CountdownContainer,
  FormContainer,
  HomeContainer,
  MinutesAmountInput,
  Separator,
  StartCountdownButton,
  StopCountdownButton,
  TaskInput,
} from "./styles";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useEffect, useState } from "react";
import { differenceInSeconds } from "date-fns";

const newCycleFormValidationSchema = zod.object({
  task: zod.string().min(1, "Informe a tarefa."),
  minutesAmount: zod
    .number()
    .min(5, "O ciclo precisa ser de no minimo 5 minutos.")
    .max(60, "O ciclo precisa ser de no máximo 60 minutos."),
});

type NewCycleFormData = zod.infer<typeof newCycleFormValidationSchema>;

/*
    Cria uma tipagem a partir dos valores bases dentro do Schema de Validation com a função infer do zod.

    Typeof necessário pois o tipo sendo criado é em TS, porém o const utilizado é JS.

*/

interface Cycle {
  id: string;
  task: string;
  minutesAmount: number;
  startDate: Date;
  interruptedDate?: Date;
  finishedDate?: Date;
}

export function Home() {
  const [cycles, setCycles] = useState<Cycle[]>([]);

  const [activeCycleId, setActiveCycleId] = useState<string | null>(null); //Armazena o Id do ciclo ativo, podendo ser nulo caso caso não tenha

  const [amountSecondsPassed, setAmountSecondsPassed] = useState(0); //Quantidade de segundos que já se passaram

  const { register, handleSubmit, watch, reset } = useForm<NewCycleFormData>({
    resolver: zodResolver(newCycleFormValidationSchema),
    defaultValues: {
      task: "",
      minutesAmount: 0,
    },
  });

  const activeCycle = cycles.find((cycle) => cycle.id === activeCycleId); //Procura se o ciclo atual é o ciclo ativo dentro do vetor de Cycles

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
          //Verifica se o total de segundos percorrido é igual ou maior que o total do ciclo - Implica que o ciclo finalizou
          setCycles((state) =>
            state.map((cycle) => {
              if (cycle.id === activeCycleId) {
                return { ...cycle, finishedDate: new Date() };
              } else {
                return cycle;
              }
            })
          );

          setAmountSecondsPassed(totalSeconds);
          clearInterval(interval);
          setActiveCycleId(null);
        } else {
          setAmountSecondsPassed(secondsDifference);
        }
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [activeCycle, totalSeconds, activeCycleId]);

  function handleCreateNewCycle(data: NewCycleFormData) {
    const id = String(new Date().getTime());

    const newCycle: Cycle = {
      id,
      task: data.task,
      minutesAmount: data.minutesAmount,
      startDate: new Date(),
    };

    setCycles((state) => [...state, newCycle]); //Captura o valor anterior do estado, e atualiza com o novo (newCycle)

    setActiveCycleId(id);

    setAmountSecondsPassed(0);

    reset(); // Retorna os valores do form para o defaultValues
  }

  function handleInterruptCycle() {
    setCycles((state) =>
      state.map((cycle) => {
        if (cycle.id === activeCycleId) {
          return { ...cycle, interruptedDate: new Date() }; //Percorre por todos os ciclos guardados e adiciona a data em que foi interrompido no ciclo atual
        } else {
          return cycle;
        }
      })
    );

    setActiveCycleId(null);
  }

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

  const task = watch("task");
  const isSubmitDisabled = !task;

  return (
    <HomeContainer>
      <form action="" onSubmit={handleSubmit(handleCreateNewCycle)}>
        <FormContainer>
          <label htmlFor="">Vou trabalhar em</label>
          <TaskInput
            id="task"
            placeholder="Dê um nome para o seu projeto"
            list="task-suggestions"
            disabled={!!activeCycle}
            {...register("task")}
          />

          <datalist id="task-suggestions">
            <option value="Projeto 1" />
            <option value="Projeto 2" />
            <option value="Projeto 3" />
          </datalist>

          <label htmlFor="">durante</label>
          <MinutesAmountInput
            type="number"
            id="minutesAmount"
            placeholder="00"
            step={5}
            min={5}
            max={60}
            disabled={!!activeCycle}
            {...register("minutesAmount", { valueAsNumber: true })}
          />

          <span>minutos.</span>
        </FormContainer>

        <CountdownContainer>
          <span>{minutes[0]}</span>
          <span>{minutes[1]}</span>
          <Separator>:</Separator>
          <span>{seconds[0]}</span>
          <span>{seconds[1]}</span>
        </CountdownContainer>

        {activeCycle ? (
          <StopCountdownButton onClick={handleInterruptCycle} type="button">
            <HandPalm size={24} />
            Interromper
          </StopCountdownButton>
        ) : (
          <StartCountdownButton disabled={isSubmitDisabled} type="submit">
            <Play size={24} />
            Começar
          </StartCountdownButton>
        )}
      </form>
    </HomeContainer>
  );
}
