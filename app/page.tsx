"use client"
import { useState } from 'react'; 
import { Heading, HStack, IconButton, Input, Table, VStack } from '@chakra-ui/react';
import { Provider } from '@/components/ui/provider';
import { LuPlus, LuTrash } from 'react-icons/lu';

interface TodoItem {
  task : string,
  index : number
}

export default function Home() {
  const [newTask, setNewTask ] = useState("");
  const [ newTaskIndex, setNewTaskIndex ] = useState(0);
  const [ tasks, setTasks ] = useState<Array<TodoItem>>([]);
  function addClicked() {
    console.log('add was clicked', newTask);
    setTasks([...tasks, {task:newTask, index:newTaskIndex}]);
    setNewTaskIndex(newTaskIndex+1)
  }
  function removeItem(i : number) {
    setTasks(tasks.toSpliced(i, 1));
  }
  return (
    <Provider>
      <VStack>
        <Heading>TODO list</Heading>
        <HStack>
          <Input value={newTask} onChange={(e) => setNewTask(e.target.value)}>
          </Input>
          <IconButton variant='surface' onClick={() => addClicked()}>
            <LuPlus/>
          </IconButton>
        </HStack>
        <Table.Root>
          <Table.Body>
            {
              tasks.map((s,i) => (
                <Table.Row> 
                  <Table.Cell>{s.task}</Table.Cell>
                  <Table.Cell>
                    <IconButton variant='surface' onClick={() => removeItem(i)}>
                      <LuTrash/>
                    </IconButton>
                  </Table.Cell>
                </Table.Row>
              ))
            }
          </Table.Body>
        </Table.Root>
      </VStack>
    </Provider>
  );
}
