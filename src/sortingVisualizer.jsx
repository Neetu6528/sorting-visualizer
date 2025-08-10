import React, { useState, useEffect, useRef } from 'react';

function getRandomColor(idx) {
  const colors = [
    'bg-blue-400',
    'bg-yellow-400',
    'bg-purple-400',
    'bg-pink-400',
    'bg-indigo-400',
    'bg-gray-500',
  ];
  return colors[idx % colors.length];
}

const ALGORITHM_INFO = {
  'Bubble Sort':
    'Repeatedly swaps adjacent elements if they are in wrong order, bubbling the largest element to the end.',
  'Selection Sort':
    'Selects the minimum element from unsorted part and places it at the beginning.',
  'Insertion Sort':
    'Builds sorted array one item at a time by inserting elements in their correct position.',
  'Merge Sort':
    'Divide and conquer algorithm that divides array and merges sorted halves.',
  'Quick Sort':
    'Divide and conquer algorithm using a pivot to partition array and sort recursively.',
  'Heap Sort':
    'Builds a heap and repeatedly extracts the maximum element.',
  'Counting Sort':
    'Counts occurrences of each value and reconstructs sorted array.',
  'Radix Sort':
    'Sorts numbers digit by digit starting from least significant digit.',
  'Shell Sort':
    'Generalization of insertion sort that allows exchanges of distant elements.',
};

function SortingVisualizer() {
  const [array, setArray] = useState([]);
  const [originalArray, setOriginalArray] = useState([]); // store original before sorting
  const [currentIndices, setCurrentIndices] = useState([]);
  const [sortedIndices, setSortedIndices] = useState([]);
  const [algorithm, setAlgorithm] = useState('Bubble Sort');
  const [isSorting, setIsSorting] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const saved = localStorage.getItem('darkTheme');
    return saved === 'true' ? true : false;
  });
  const [speed, setSpeed] = useState(500);
  const [isPaused, setIsPaused] = useState(false);
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const [arraySize, setArraySize] = useState(10);

  const isPausedRef = useRef(isPaused);
  const isSortingRef = useRef(isSorting);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    isSortingRef.current = isSorting;
  }, [isSorting]);

  useEffect(() => {
    generateArray();
  }, [arraySize]);

  useEffect(() => {
    localStorage.setItem('darkTheme', isDarkTheme);
  }, [isDarkTheme]);

  const toggleTheme = () => setIsDarkTheme((prev) => !prev);

  const sleep = (ms) =>
    new Promise((resolve) => {
      const check = () => {
        if (!isSortingRef.current) return resolve();
        if (!isPausedRef.current) return resolve();
        setTimeout(check, 50);
      };
      setTimeout(check, ms);
    });

  async function waitIfPaused() {
    while (isPausedRef.current) {
      if (!isSortingRef.current) break;
      await new Promise((r) => setTimeout(r, 50));
    }
  }

  const generateArray = () => {
    if (isSorting) return;
    const arr = Array.from({ length: arraySize }, () =>
      Math.floor(Math.random() * 90) + 10
    );
    setArray(arr);
    setOriginalArray(arr); // store for reset
    setCurrentIndices([]);
    setSortedIndices([]);
    setComparisons(0);
    setSwaps(0);
  };

  const resetSorting = () => {
    setIsSorting(false);
    setIsPaused(false);
    setArray([...originalArray]); // restore original
    setCurrentIndices([]);
    setSortedIndices([]);
    setComparisons(0);
    setSwaps(0);
  };

  const incComparisons = () => setComparisons((c) => c + 1);
  const incSwaps = () => setSwaps((s) => s + 1);
  const delay = () => sleep(speed);

  // === Sorting algorithms ===

  const bubbleSort = async () => {
    let arr = array.slice();
    let n = arr.length;
    let sorted = [];
    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      for (let j = 0; j < n - i - 1; j++) {
        setCurrentIndices([j, j + 1]);
        incComparisons();
        await waitIfPaused();
        await delay();
        if (!isSortingRef.current) return;

        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setArray(arr.slice());
          incSwaps();
          swapped = true;
          await waitIfPaused();
          await delay();
          if (!isSortingRef.current) return;
        }
      }
      sorted.push(n - i - 1);
      setSortedIndices([...sorted]);
      if (!swapped) break;
    }
    if (!sorted.includes(0)) sorted.push(0);
    setSortedIndices([...sorted]);
    setCurrentIndices([]);
  };

  const selectionSort = async () => {
    let arr = array.slice();
    let n = arr.length;
    let sorted = [];
    for (let i = 0; i < n; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        setCurrentIndices([minIdx, j]);
        incComparisons();
        await waitIfPaused();
        await delay();
        if (!isSortingRef.current) return;
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
        }
      }
      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        setArray(arr.slice());
        incSwaps();
        await waitIfPaused();
        await delay();
        if (!isSortingRef.current) return;
      }
      sorted.push(i);
      setSortedIndices([...sorted]);
    }
    setCurrentIndices([]);
  };

  const insertionSort = async () => {
    let arr = array.slice();
    let n = arr.length;
    let sorted = [0];
    for (let i = 1; i < n; i++) {
      let key = arr[i];
      let j = i - 1;
      while (j >= 0) {
        incComparisons();
        setCurrentIndices([j, j + 1]);
        await waitIfPaused();
        await delay();
        if (!isSortingRef.current) return;

        if (arr[j] > key) {
          arr[j + 1] = arr[j];
          setArray(arr.slice());
          incSwaps();
          j--;
          await waitIfPaused();
          await delay();
          if (!isSortingRef.current) return;
        } else {
          break;
        }
      }
      arr[j + 1] = key;
      setArray(arr.slice());
      sorted.push(i);
      setSortedIndices([...sorted]);
    }
    setCurrentIndices([]);
  };

  // Merge Sort
  const merge = async (arr, l, m, r) => {
    let n1 = m - l + 1;
    let n2 = r - m;
    let L = arr.slice(l, m + 1);
    let R = arr.slice(m + 1, r + 1);
    let i = 0,
      j = 0,
      k = l;

    while (i < n1 && j < n2) {
      setCurrentIndices([k]);
      incComparisons();
      await waitIfPaused();
      await delay();
      if (!isSortingRef.current) return;

      if (L[i] <= R[j]) {
        arr[k] = L[i];
        i++;
      } else {
        arr[k] = R[j];
        j++;
      }
      setArray(arr.slice());
      k++;
    }

    while (i < n1) {
      setCurrentIndices([k]);
      arr[k++] = L[i++];
      setArray(arr.slice());
      await waitIfPaused();
      await delay();
    }
    while (j < n2) {
      setCurrentIndices([k]);
      arr[k++] = R[j++];
      setArray(arr.slice());
      await waitIfPaused();
      await delay();
    }
    setCurrentIndices([]);
  };

  const mergeSortHelper = async (arr, l, r) => {
    if (l >= r) return;
    let m = Math.floor((l + r) / 2);
    await mergeSortHelper(arr, l, m);
    await mergeSortHelper(arr, m + 1, r);
    await merge(arr, l, m, r);
  };

  const mergeSort = async () => {
    let arr = array.slice();
    await mergeSortHelper(arr, 0, arr.length - 1);
    setSortedIndices(Array.from({ length: arr.length }, (_, i) => i));
    setCurrentIndices([]);
  };

  // Quick Sort
  const partition = async (arr, low, high) => {
    let pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      setCurrentIndices([j, high]);
      incComparisons();
      await waitIfPaused();
      await delay();
      if (!isSortingRef.current) return i;

      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        setArray(arr.slice());
        incSwaps();
        await waitIfPaused();
        await delay();
        if (!isSortingRef.current) return i;
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    setArray(arr.slice());
    incSwaps();
    setCurrentIndices([]);
    return i + 1;
  };

  const quickSortHelper = async (arr, low, high) => {
    if (low < high) {
      let pi = await partition(arr, low, high);
      await quickSortHelper(arr, low, pi - 1);
      await quickSortHelper(arr, pi + 1, high);
    }
  };

  const quickSort = async () => {
    let arr = array.slice();
    await quickSortHelper(arr, 0, arr.length - 1);
    setSortedIndices(Array.from({ length: arr.length }, (_, i) => i));
    setCurrentIndices([]);
  };

  // Heap Sort
  const heapify = async (arr, n, i) => {
    let largest = i;
    let l = 2 * i + 1;
    let r = 2 * i + 2;

    if (l < n) {
      incComparisons();
      setCurrentIndices([i, l]);
      await waitIfPaused();
      await delay();
      if (arr[l] > arr[largest]) largest = l;
    }
    if (r < n) {
      incComparisons();
      setCurrentIndices([largest, r]);
      await waitIfPaused();
      await delay();
      if (arr[r] > arr[largest]) largest = r;
    }

    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      setArray(arr.slice());
      incSwaps();
      await waitIfPaused();
      await delay();
      await heapify(arr, n, largest);
    }
    setCurrentIndices([]);
  };

  const heapSort = async () => {
    let arr = array.slice();
    let n = arr.length;

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      await heapify(arr, n, i);
    }

    let sorted = [];
    for (let i = n - 1; i > 0; i--) {
      [arr[0], arr[i]] = [arr[i], arr[0]];
      setArray(arr.slice());
      incSwaps();
      sorted.push(i);
      setSortedIndices([...sorted]);
      await heapify(arr, i, 0);
    }
    sorted.push(0);
    setSortedIndices([...sorted]);
    setCurrentIndices([]);
  };

  // Counting Sort
  const countingSort = async () => {
    let arr = array.slice();
    let max = Math.max(...arr);
    let count = Array(max + 1).fill(0);

    for (let i = 0; i < arr.length; i++) {
      count[arr[i]]++;
    }

    let index = 0;
    for (let i = 0; i <= max; i++) {
      while (count[i] > 0) {
        arr[index++] = i;
        count[i]--;
        setArray(arr.slice());
        await waitIfPaused();
        await delay();
        if (!isSortingRef.current) return;
      }
    }
    setSortedIndices(Array.from({ length: arr.length }, (_, i) => i));
  };

  const shellSort = async () => {
    let arr = array.slice();
    let n = arr.length;
    let sorted = [];

    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
      for (let i = gap; i < n; i++) {
        let temp = arr[i];
        let j = i;

        while (j >= gap && arr[j - gap] > temp) {
          incComparisons();
          setCurrentIndices([j, j - gap]);
          await waitIfPaused();
          await delay();
          if (!isSortingRef.current) return;

          arr[j] = arr[j - gap];
          setArray(arr.slice());
          incSwaps();
          j -= gap;

          await waitIfPaused();
          await delay();
          if (!isSortingRef.current) return;
        }

        arr[j] = temp;
        setArray(arr.slice());
        sorted.push(j);
        setSortedIndices([...sorted]);

        await waitIfPaused();
        await delay();
        if (!isSortingRef.current) return;
      }
    }
    setSortedIndices(Array.from({ length: arr.length }, (_, i) => i));
    setCurrentIndices([]);
  };

  // Radix Sort helpers and function
  const countingSortForRadix = async (arr, exp) => {
    let output = new Array(arr.length).fill(0);
    let count = new Array(10).fill(0);

    for (let i = 0; i < arr.length; i++) {
      let index = Math.floor(arr[i] / exp) % 10;
      count[index]++;
      incComparisons();
      await waitIfPaused();
      await delay();
      if (!isSortingRef.current) return;
    }

    for (let i = 1; i < 10; i++) {
      count[i] += count[i - 1];
    }

    for (let i = arr.length - 1; i >= 0; i--) {
      let index = Math.floor(arr[i] / exp) % 10;
      output[count[index] - 1] = arr[i];
      count[index]--;
      setCurrentIndices([i]);
      setArray(output.slice());
      incSwaps();
      await waitIfPaused();
      await delay();
      if (!isSortingRef.current) return;
    }

    for (let i = 0; i < arr.length; i++) {
      arr[i] = output[i];
    }
  };

  const radixSort = async () => {
    let arr = array.slice();
    let max = Math.max(...arr);

    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
      await countingSortForRadix(arr, exp);
    }
    setArray(arr.slice());
    setSortedIndices(Array.from({ length: arr.length }, (_, i) => i));
    setCurrentIndices([]);
  };

  const startSort = async () => {
    if (isSorting) return;
    setIsSorting(true);
    setComparisons(0);
    setSwaps(0);
    setSortedIndices([]);
    switch (algorithm) {
      case 'Bubble Sort':
        await bubbleSort();
        break;
      case 'Selection Sort':
        await selectionSort();
        break;
      case 'Insertion Sort':
        await insertionSort();
        break;
      case 'Merge Sort':
        await mergeSort();
        break;
      case 'Quick Sort':
        await quickSort();
        break;
      case 'Heap Sort':
        await heapSort();
        break;
      case 'Counting Sort':
        await countingSort();
        break;
      case 'Shell Sort':       // <-- added here
        await shellSort();
        break;
      case 'Radix Sort':       // <-- added here
        await radixSort();
        break;
      default:
        alert('Algorithm not implemented!');
    }
    setIsSorting(false);
    setCurrentIndices([]);
  };

  const handlePauseResume = () => {
    if (!isSorting) return;
    setIsPaused((p) => !p);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 flex flex-col items-center py-6 px-4 ${isDarkTheme ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'
        }`}
    >
      <header className="w-full max-w-7xl flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Sorting Visualizer</h1>
        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded bg-yellow-400 text-black hover:bg-yellow-500 transition"
        >
          {isDarkTheme ? 'Light Mode' : 'Dark Mode'}
        </button>
      </header>

      <section className="w-full max-w-7xl flex flex-wrap gap-4 mb-6 items-center justify-center">
        <select
          disabled={isSorting}
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
          className="p-2 border rounded text-black min-w-[200px] bg-gray-200"
        >
          {Object.keys(ALGORITHM_INFO).map((algo) => (
            <option key={algo} value={algo}>
              {algo}
            </option>
          ))}
        </select>

        <label className="flex flex-col items-center text-sm min-w-[150px]">
          Array Size: {arraySize}
          <input
            type="range"
            min={5}
            max={50}
            value={arraySize}
            disabled={isSorting}
            onChange={(e) => setArraySize(+e.target.value)}
            className="w-full"
          />
        </label>

        <label className="flex flex-col items-center text-sm min-w-[150px]">
          Speed (ms): {speed}
          <input
            type="range"
            min={50}
            max={1500}
            step={50}
            value={speed}
            onChange={(e) => setSpeed(+e.target.value)}
            disabled={!isSorting}
            className="w-full"
          />
        </label>

        <button
          onClick={generateArray}
          disabled={isSorting}
          className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-800 transition"
        >
          Generate Array
        </button>

        {!isSorting && (
          <button
            onClick={startSort}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Start Sorting
          </button>
        )}

        {isSorting && (
          <>
            <button
              onClick={handlePauseResume}
              className="px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 transition"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={resetSorting}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
            >
              Stop & Reset
            </button>
          </>
        )}
      </section>

      <section className="w-full max-w-7xl mb-8 px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-100">
        <strong>About {algorithm}:</strong> {ALGORITHM_INFO[algorithm]}
      </section>

      <div
        className={`w-full max-w-7xl flex flex-wrap justify-center gap-4 mb-6 p-4 rounded shadow-md ${isDarkTheme ? 'bg-gray-800' : 'bg-white'
          }`}
      >
        {array.map((value, idx) => {
          const isCurrent = currentIndices.includes(idx);
          const isSorted = sortedIndices.includes(idx);
          const baseColor = getRandomColor(idx);
          const colorClass = isSorted
            ? 'bg-green-500'
            : isCurrent
              ? 'bg-red-500'
              : baseColor;

          return (
            <div
              key={idx}
              className={`flex items-center justify-center text-white font-semibold text-xl rounded-full transition-all duration-300
                w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 ${colorClass}`}
              style={{ userSelect: 'none' }}
            >
              {value}
            </div>
          );
        })}
      </div>

      <footer className="w-full max-w-7xl flex justify-center space-x-8 text-lg">
        <div>
          Comparisons: <span className="font-bold">{comparisons}</span>
        </div>
        <div>
          Swaps: <span className="font-bold">{swaps}</span>
        </div>
      </footer>
    </div>
  );
}

export default SortingVisualizer;


