const useUtilsHooks = () => {
  const getTargetServiceName = async (services, targetId) => {
    const currentService = services.find((service) => service.id === targetId);

    return currentService.name;
  };

  const getTargetLocationName = async (locations, targetId) => {
    const currentLocation = locations.find(
      (location) => location.id === targetId
    );

    return currentLocation.name;
  };

  return {
    getTargetServiceName,
    getTargetLocationName,
  };
};

export default useUtilsHooks;
