import React, { useState, useMemo, useRef, useEffect } from 'react';
import TinderCard from 'react-tinder-card';
import axios from 'axios';


function Advanced() {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastDirection, setLastDirection] = useState();
  const [preloadedImages, setPreloadedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Define isLoading state
  const currentIndexRef = useRef(currentIndex);
  const childRefs = useMemo(() => Array(cards.length).fill(0).map(() => React.createRef()), [cards]);

  useEffect(() => {
    fetchNewCard();
  }, []);

  useEffect(() => {
    preloadImages();
  }, [cards]);

  const fetchNewCard = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await axios.get('https://sdk-api.pump.fun/coins/?limit=1&offset=' + (cards.length || 1));
      const newCard = response.data[0];
      setCards(prevCards => [...prevCards, newCard]);
      updateCurrentIndex(cards.length); // Update index after adding the new card
    } catch (error) {
      console.error('Error fetching new card:', error);
    } finally {
      setIsLoading(false);
    }
  }
  
  const updateCurrentIndex = (val) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  }

  const canGoBack = currentIndex > 0;
  const canSwipe = currentIndex < cards.length;

  const swiped = async (direction, nameToDelete, index) => {
    setLastDirection(direction);
    if (index === cards.length - 1) {
      await fetchNewCard();
    }
    updateCurrentIndex(index + 1);
  }

  const outOfFrame = (coin, idx) => {
    console.log(`${coin.name} (${idx}) left the screen!`, currentIndexRef.current);
    if (childRefs[idx] && childRefs[idx].current) {
      currentIndexRef.current >= idx && childRefs[idx].current.restoreCard();
    }
  }

  const swipe = async (dir) => {
    if (!canSwipe || !childRefs[currentIndex] || !childRefs[currentIndex].current) return;
    await childRefs[currentIndex].current.swipe(dir);
  }

  const goBack = async () => {
    console.log("Undo button clicked"); // Log to check if goBack function is called
    if (!canGoBack || !cards[currentIndex - 1]) return;
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex); // Update currentIndex to display the previous card
  }
  
  const preloadImages = () => {
    const preloadCount = 2; // Number of images to preload
    const startIndex = currentIndex + preloadCount;
    const endIndex = Math.min(cards.length - 1, startIndex + preloadCount);
    const imagesToPreload = cards.slice(startIndex, endIndex + 1).map(card => new Image().src = card.image_uri);
    setPreloadedImages(imagesToPreload);
  }

  return (
    <div>
      <h1>React Tinder Card</h1>
      <div className='cardContainer'>
  {currentIndex < cards.length && (
    <TinderCard
      ref={childRefs[currentIndex]}
      className='swipe'
      key={`${cards[currentIndex].id}-${currentIndex}`}
      onSwipe={(dir) => swiped(dir, cards[currentIndex].name, currentIndex)}
      onCardLeftScreen={() => outOfFrame(cards[currentIndex], currentIndex)}
    >
      <div
        style={{ backgroundImage: `url(${cards[currentIndex].image_uri})` }}
        className='card'
      >
        <h3>{cards[currentIndex].name}</h3>
      </div>
    </TinderCard>
  )}
</div>
      <div className='buttons'>
        <button style={{ backgroundColor: (!canSwipe) ? '#c3c4d3' : undefined }} onClick={() => swipe('left')} disabled={!canSwipe}>Swipe left!</button>
        <button style={{ backgroundColor: (!canGoBack) ? '#c3c4d3' : undefined }} onClick={() => goBack()} disabled={!canGoBack}>Undo swipe!</button>
        <button style={{ backgroundColor: (!canSwipe) ? '#c3c4d3' : undefined }} onClick={() => swipe('right')} disabled={!canSwipe}>Swipe right!</button>
      </div>
      {lastDirection ? (
        <h2 key={lastDirection} className='infoText'>
          You swiped {lastDirection}
        </h2>
      ) : (
        <h2 className='infoText'>
        Swipe a card or press a button to get Restore Card button visible!
        </h2>
        )}
        </div>
        );
        }
        export default Advanced;