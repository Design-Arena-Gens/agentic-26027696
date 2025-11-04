'use client'

import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls, Sky } from '@react-three/drei'
import * as THREE from 'three'

function Player({ position, onMove }) {
  const { camera } = useThree()
  const velocity = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())
  const keys = useRef({ w: false, a: false, s: false, d: false, shift: false })

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() in keys.current) {
        keys.current[e.key.toLowerCase()] = true
      }
    }
    const handleKeyUp = (e) => {
      if (e.key.toLowerCase() in keys.current) {
        keys.current[e.key.toLowerCase()] = false
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame((state, delta) => {
    const speed = keys.current.shift ? 10 : 5

    direction.current.set(0, 0, 0)

    if (keys.current.w) direction.current.z -= 1
    if (keys.current.s) direction.current.z += 1
    if (keys.current.a) direction.current.x -= 1
    if (keys.current.d) direction.current.x += 1

    direction.current.normalize()

    const forward = new THREE.Vector3()
    camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()

    const right = new THREE.Vector3()
    right.crossVectors(forward, camera.up).normalize()

    velocity.current.set(0, 0, 0)
    velocity.current.addScaledVector(forward, -direction.current.z * speed * delta)
    velocity.current.addScaledVector(right, direction.current.x * speed * delta)

    camera.position.add(velocity.current)
    camera.position.y = 1.7

    if (onMove) onMove(camera.position)
  })

  return null
}

function Map() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#2a5934" />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 2.5, -20]} castShadow receiveShadow>
        <boxGeometry args={[40, 5, 1]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>

      <mesh position={[0, 2.5, 20]} castShadow receiveShadow>
        <boxGeometry args={[40, 5, 1]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>

      <mesh position={[-20, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 5, 40]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>

      <mesh position={[20, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 5, 40]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>

      {/* Boxes for cover */}
      <mesh position={[5, 1, 5]} castShadow receiveShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      <mesh position={[-5, 1, -5]} castShadow receiveShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      <mesh position={[10, 1, -10]} castShadow receiveShadow>
        <boxGeometry args={[3, 2, 3]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      <mesh position={[-10, 1, 10]} castShadow receiveShadow>
        <boxGeometry args={[3, 2, 3]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Central structure */}
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 4, 4]} />
        <meshStandardMaterial color="#696969" />
      </mesh>
    </>
  )
}

function Crosshair() {
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      color: 'white',
      fontSize: '24px',
      fontWeight: 'bold',
      pointerEvents: 'none',
      zIndex: 1000,
      textShadow: '0 0 3px black'
    }}>
      +
    </div>
  )
}

function Weapon() {
  const meshRef = useRef()
  const { camera } = useThree()
  const [shooting, setShooting] = useState(false)
  const muzzleFlashRef = useRef()

  useEffect(() => {
    const handleMouseDown = () => {
      setShooting(true)
      setTimeout(() => setShooting(false), 100)
    }
    window.addEventListener('mousedown', handleMouseDown)
    return () => window.removeEventListener('mousedown', handleMouseDown)
  }, [])

  useFrame(() => {
    if (meshRef.current) {
      const offset = new THREE.Vector3(0.3, -0.2, -0.5)
      offset.applyQuaternion(camera.quaternion)
      meshRef.current.position.copy(camera.position).add(offset)
      meshRef.current.rotation.copy(camera.rotation)
    }

    if (muzzleFlashRef.current) {
      muzzleFlashRef.current.visible = shooting
    }
  })

  return (
    <group ref={meshRef}>
      <mesh>
        <boxGeometry args={[0.05, 0.05, 0.4]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0, 0, -0.15]}>
        <boxGeometry args={[0.08, 0.08, 0.15]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      <pointLight
        ref={muzzleFlashRef}
        position={[0, 0, -0.25]}
        intensity={10}
        distance={5}
        color="orange"
        visible={false}
      />
    </group>
  )
}

function HUD({ ammo, health, score }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      color: 'white',
      fontFamily: 'monospace',
      fontSize: '18px',
      textShadow: '2px 2px 4px black',
      zIndex: 1000,
      pointerEvents: 'none'
    }}>
      <div>Health: {health}</div>
      <div>Ammo: {ammo}/90</div>
      <div>Score: {score}</div>
    </div>
  )
}

function Instructions({ started, onStart }) {
  if (started) return null

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      zIndex: 2000,
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '30px' }}>CS-LIKE FPS</h1>
      <div style={{ maxWidth: '600px', textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Controls:</h2>
        <p><strong>WASD</strong> - Move</p>
        <p><strong>Mouse</strong> - Look around</p>
        <p><strong>Left Click</strong> - Shoot</p>
        <p><strong>Shift</strong> - Sprint</p>
      </div>
      <button
        onClick={onStart}
        style={{
          padding: '15px 40px',
          fontSize: '24px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
      >
        START GAME
      </button>
    </div>
  )
}

export default function Game() {
  const [started, setStarted] = useState(false)
  const [ammo, setAmmo] = useState(30)
  const [health, setHealth] = useState(100)
  const [score, setScore] = useState(0)

  return (
    <>
      <Instructions started={started} onStart={() => setStarted(true)} />
      {started && (
        <>
          <Crosshair />
          <HUD ammo={ammo} health={health} score={score} />
        </>
      )}
      <Canvas
        shadows
        camera={{ position: [0, 1.7, 10], fov: 75 }}
        style={{ width: '100vw', height: '100vh' }}
      >
        <Sky sunPosition={[100, 20, 100]} />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[0, 10, 0]} intensity={0.5} />

        <Map />
        <Player position={[0, 1.7, 10]} />
        <Weapon />

        {started && <PointerLockControls />}
      </Canvas>
    </>
  )
}
