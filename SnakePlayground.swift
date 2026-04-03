import SwiftUI
import PlaygroundSupport

// MARK: - Model

enum Direction {
    case up, down, left, right
}

struct Point: Equatable {
    var x: Int
    var y: Int
}

@MainActor
final class SnakeGame: ObservableObject {
    @Published private(set) var snake: [Point] = [Point(x: 5, y: 5)]
    @Published private(set) var food: Point = Point(x: 10, y: 10)
    @Published private(set) var score: Int = 0
    @Published private(set) var isGameOver: Bool = false

    let columns: Int
    let rows: Int

    private var direction: Direction = .right
    private var pendingDirection: Direction = .right

    init(columns: Int = 20, rows: Int = 20) {
        self.columns = columns
        self.rows = rows
        reset()
    }

    func reset() {
        snake = [Point(x: columns / 2, y: rows / 2)]
        direction = .right
        pendingDirection = .right
        score = 0
        isGameOver = false
        spawnFood()
    }

    func setDirection(_ newDirection: Direction) {
        // Prevent 180-degree turns in one move.
        switch (direction, newDirection) {
        case (.up, .down), (.down, .up), (.left, .right), (.right, .left):
            return
        default:
            pendingDirection = newDirection
        }
    }

    func step() {
        guard !isGameOver else { return }

        direction = pendingDirection

        guard let head = snake.first else { return }
        var next = head

        switch direction {
        case .up: next.y -= 1
        case .down: next.y += 1
        case .left: next.x -= 1
        case .right: next.x += 1
        }

        if next.x < 0 || next.x >= columns || next.y < 0 || next.y >= rows {
            isGameOver = true
            return
        }

        if snake.contains(next) {
            isGameOver = true
            return
        }

        snake.insert(next, at: 0)

        if next == food {
            score += 1
            spawnFood()
        } else {
            snake.removeLast()
        }
    }

    private func spawnFood() {
        var candidate = Point(x: Int.random(in: 0..<columns), y: Int.random(in: 0..<rows))

        while snake.contains(candidate) {
            candidate = Point(x: Int.random(in: 0..<columns), y: Int.random(in: 0..<rows))
        }

        food = candidate
    }
}

// MARK: - View

struct SnakeGameView: View {
    @StateObject private var game = SnakeGame(columns: 20, rows: 20)

    private let tickInterval: TimeInterval = 0.15

    var body: some View {
        VStack(spacing: 16) {
            Text("Snake")
                .font(.largeTitle.bold())

            Text("Score: \(game.score)")
                .font(.headline)

            TimelineView(.periodic(from: .now, by: tickInterval)) { _ in
                Canvas { context, size in
                    let cellWidth = size.width / CGFloat(game.columns)
                    let cellHeight = size.height / CGFloat(game.rows)

                    // Background
                    let boardRect = CGRect(origin: .zero, size: size)
                    context.fill(Path(boardRect), with: .color(.black.opacity(0.85)))

                    // Food
                    drawCell(game.food, color: .red, cellWidth: cellWidth, cellHeight: cellHeight, context: &context)

                    // Snake
                    for (index, segment) in game.snake.enumerated() {
                        let color: Color = index == 0 ? .green : .green.opacity(0.8)
                        drawCell(segment, color: color, cellWidth: cellWidth, cellHeight: cellHeight, context: &context)
                    }
                }
                .frame(width: 360, height: 360)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(.white.opacity(0.25), lineWidth: 1)
                )
                .onTapGesture {
                    if game.isGameOver { game.reset() }
                }
            }

            if game.isGameOver {
                Text("Game Over — Tap board or press Restart")
                    .foregroundStyle(.red)
            }

            HStack(spacing: 12) {
                controlButton("↑") { game.setDirection(.up) }
            }

            HStack(spacing: 12) {
                controlButton("←") { game.setDirection(.left) }
                controlButton("↓") { game.setDirection(.down) }
                controlButton("→") { game.setDirection(.right) }
            }

            Button("Restart") {
                game.reset()
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
        .background(Color(.systemBackground))
        .onReceive(Timer.publish(every: tickInterval, on: .main, in: .common).autoconnect()) { _ in
            game.step()
        }
    }

    private func controlButton(_ label: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(label)
                .font(.title2.bold())
                .frame(width: 64, height: 44)
        }
        .buttonStyle(.bordered)
    }

    private func drawCell(
        _ point: Point,
        color: Color,
        cellWidth: CGFloat,
        cellHeight: CGFloat,
        context: inout GraphicsContext
    ) {
        let rect = CGRect(
            x: CGFloat(point.x) * cellWidth + 1,
            y: CGFloat(point.y) * cellHeight + 1,
            width: cellWidth - 2,
            height: cellHeight - 2
        )

        context.fill(
            Path(roundedRect: rect, cornerRadius: 4),
            with: .color(color)
        )
    }
}

PlaygroundPage.current.setLiveView(SnakeGameView())
