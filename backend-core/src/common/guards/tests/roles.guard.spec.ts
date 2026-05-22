import { Reflector } from "@nestjs/core";
import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { RolesGuard } from "../roles.guard";
import { UserRole } from "@prisma/client";

describe("RolesGuard", () => {
  let guard: RolesGuard;
  let reflectorMock: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflectorMock = {
      getAllAndOverride: jest.fn(),
    } as any;
    guard = new RolesGuard(reflectorMock);
  });

  function createMockExecutionContext(
    user: any,
    handler: any = () => {},
    classRef: any = {},
  ): ExecutionContext {
    return {
      getHandler: () => handler,
      getClass: () => classRef,
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as any;
  }

  it("should allow access (return true) if no required roles are specified", () => {
    reflectorMock.getAllAndOverride.mockReturnValue(undefined);

    const context = createMockExecutionContext({ role: UserRole.STUDENT });
    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(reflectorMock.getAllAndOverride).toHaveBeenCalled();
  });

  it("should allow access (return true) if required roles list is empty", () => {
    reflectorMock.getAllAndOverride.mockReturnValue([]);

    const context = createMockExecutionContext({ role: UserRole.STUDENT });
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it("should throw ForbiddenException if user is not present in request", () => {
    reflectorMock.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    const context = createMockExecutionContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(
      new ForbiddenException("User not authenticated"),
    );
  });

  it("should throw ForbiddenException if user role does not match required roles", () => {
    reflectorMock.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    const context = createMockExecutionContext({ role: UserRole.STUDENT });

    expect(() => guard.canActivate(context)).toThrow(
      new ForbiddenException("Access denied. Required roles: ADMIN"),
    );
  });

  it("should allow access (return true) if user role matches required roles", () => {
    reflectorMock.getAllAndOverride.mockReturnValue([UserRole.STUDENT, UserRole.ADMIN]);

    const context = createMockExecutionContext({ role: UserRole.STUDENT });
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });
});
